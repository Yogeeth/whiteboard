import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const servers = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
};
const WebRTCAppAutomated = ({ room = "room" }) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);

  const user1VideoRef = useRef(null);
  const user2VideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnection = useRef(null);
  const remoteStream = useRef(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        user1VideoRef.current.srcObject = stream;
        user1VideoRef.current.muted = true;
        setLocalStream(stream);
      } catch (err) {
        console.error("Failed to get media:", err);
      }
    };

    initMedia();
  }, []);

  useEffect(() => {
    if (!localStream) return;

    socketRef.current = io("http://localhost:5001");
    socketRef.current.emit("join-room", { room });

    socketRef.current.on("offer", async (offer) => {
      const pc = createPeerConnection();
      peerConnection.current = pc;

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("answer", { answer, room });
    });

    socketRef.current.on("answer", async (answer) => {
      if (!peerConnection.current.currentRemoteDescription) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on("ice-candidate", ({ candidate }) => {
      if (candidate && peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [localStream]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(servers);

    remoteStream.current = new MediaStream();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { candidate: event.candidate, room });
      }
    };

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (!remoteStream.current.getTracks().includes(track)) {
          remoteStream.current.addTrack(track);
        }
      });
      if (user2VideoRef.current) {
        user2VideoRef.current.srcObject = remoteStream.current;
      }
    };

    return pc;
  };

  const createOffer = async () => {
    if (!localStream) return;

    const pc = createPeerConnection();
    peerConnection.current = pc;

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit("offer", { offer, room });
  };

  return (
    <div className="z-100 p-4 space-y-4">
      <div className="grid grid-rows-2 gap-4 h-64 md:h-80 lg:h-96 w-full mt-[10%]">
        {videoEnabled && (
          <div className="relative bg-gray-900 rounded overflow-hidden shadow-lg">
            <video ref={user1VideoRef} autoPlay playsInline className="w-full rounded shadow" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              You
            </div>
          </div>
        )}

        {videoEnabled && (
          <div className="relative bg-gray-900 rounded overflow-hidden shadow-lg">
            <video ref={user2VideoRef} autoPlay playsInline className="w-full rounded shadow" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Other User
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-between h-fit">
          <button
            onClick={() => {
              createOffer();
              setVideoEnabled(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={!localStream}
          >
            Turn On
          </button>

          <button
            onClick={() => {
              setVideoEnabled(false);
            }}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Turn Off
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebRTCAppAutomated;
