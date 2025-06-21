import React, { useEffect, useRef, useState } from "react";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const ManualWebRTCApp = () => {
  const user1VideoRef = useRef(null);
  const user2VideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [offerSDP, setOfferSDP] = useState("");
  const [answerSDP, setAnswerSDP] = useState("");
  const [copyFeedback, setCopyFeedback] = useState({ offer: false, answer: false });
  
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      user1VideoRef.current.srcObject = stream;
      setLocalStream(stream);
    };
    init();
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(servers);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const sdp = pc.localDescription;
        if (sdp.type === "offer") {
          setOfferSDP(JSON.stringify(sdp));
        } else {
          setAnswerSDP(JSON.stringify(sdp));
        }
      }
    };

    user2VideoRef.current.srcObject = remoteStream;
    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    setPeerConnection(pc);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    setOfferSDP(JSON.stringify(offer));
  };

  const createAnswer = async () => {
    const pc = createPeerConnection();
    setPeerConnection(pc);
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    const offer = JSON.parse(offerSDP);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    setAnswerSDP(JSON.stringify(answer));
  };

  const addAnswer = async () => {
    const answer = JSON.parse(answerSDP);
    if (!peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ ...copyFeedback, [type]: true });
      setTimeout(() => {
        setCopyFeedback({ ...copyFeedback, [type]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const pasteFromClipboard = async (type) => {
    try {
      const text = await navigator.clipboard.readText();
      if (type === 'offer') {
        setOfferSDP(text);
      } else {
        setAnswerSDP(text);
      }
    } catch (err) {
      console.error('Failed to paste text: ', err);
    }
  };

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <h1 className="text-xl font-bold text-center">🔥Manual WebRTC React Demo</h1>
      
      {/* Video Container with Fixed Height */}
      <div className="grid grid-cols-2 gap-4 h-64 md:h-80 lg:h-96">
        <div className="relative bg-gray-900 rounded overflow-hidden shadow-lg">
          <video 
            ref={user1VideoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            Local Video
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded overflow-hidden shadow-lg">
          <video 
            ref={user2VideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            Remote Video
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={createOffer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Create Offer
        </button>
        <button
          onClick={createAnswer}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Create Answer
        </button>
        <button
          onClick={addAnswer}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
        >
          Add Answer
        </button>
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-2">Offer SDP (Blured)</label>

          <button
                onClick={() => copyToClipboard(offerSDP, 'offer')}
                className={`p-1.5 rounded transition-colors ${
                  copyFeedback.offer 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => pasteFromClipboard('offer')}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                title="Paste from clipboard"
              >
                Paste
              </button>
          </div>
          <div className="relative">
            <textarea
              className="w-full p-2 pr-20 border rounded resize-none blur-2xl hover:blur-none focus:blur-none transition-all duration-200"
              rows="6"
              placeholder="Offer SDP will appear here..."
              value={offerSDP}
              onChange={(e) => setOfferSDP(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-2">Answer SDP(Blured)</label>
          <button
                onClick={() => copyToClipboard(answerSDP, 'answer')}
                className={`p-1.5 rounded transition-colors ${
                  copyFeedback.answer 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => pasteFromClipboard('answer')}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                title="Paste from clipboard"
              >
                paste
              </button>
          </div>
          <div className="relative">
            <textarea
              className="w-full p-2 pr-20 border rounded resize-none blur-2xl hover:blur-none focus:blur-none transition-all duration-200"
              rows="6"
              placeholder="Answer SDP will appear here..."
              value={answerSDP}
              onChange={(e) => setAnswerSDP(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualWebRTCApp;