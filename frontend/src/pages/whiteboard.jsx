import React, { useRef, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
import ResizeAlert from "./resize";
import WebRTCAppAutomated from "./AutomatedWebRTCConnection";

const socket = io("http://localhost:5000");

const CanvasBoard = () => {
  const { userId, room } = useParams();

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const colorRef = useRef("#000000");
  const sizeref = useRef(4);

  const [input, setInput] = useState('');
  const [mssg, setMssg] = useState([]);
  const [ai, setAi] = useState([]);
  const [chat, setChat] = useState(true);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = useCallback(async (input) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai-req", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      setAi((prevAi) => {
        const updated = [...prevAi];
        updated[updated.length - 1].output = data.output;
        return updated;
      });
    } catch (err) {
      console.error("Error:", err);
      setAi((prevAi) => {
        const updated = [...prevAi];
        updated[updated.length - 1].output = "Error: Could not get AI response.";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    colorRef.current = color;
    sizeref.current = brushSize;
  }, [color, brushSize]);

  const handleAi = () => setChat((a) => !a);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imgData, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !room) return;
    const ctx = canvas.getContext("2d");

    socket.emit("join", { roomId: room });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const drawLine = (from, to, color, brushSize) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getMousePos(e);
      drawLine(lastPosRef.current, lastPosRef.current, colorRef.current, sizeref.current);
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const currentPos = getMousePos(e);
      const { x, y } = lastPosRef.current;

      drawLine({ x, y }, currentPos, colorRef.current, sizeref.current);

      socket.emit("draw_line", {
        roomId: room,
        from: { x, y },
        to: currentPos,
        color: colorRef.current,
        brushSize: sizeref.current,
      });

      lastPosRef.current = currentPos;
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      isDrawingRef.current = false;
    };

    socket.on("draw_line", ({ from, to, color, brushSize }) => {
      drawLine(from, to, color, brushSize);
    });

    socket.on("recvmsg", (msg) => setMssg((a) => [...a, msg]));

    socket.on("alert", ({ alert }) => alert && setAlert(true));

    canvas.addEventListener("pointerdown", handleMouseDown, { passive: false });
    canvas.addEventListener("pointermove", handleMouseMove, { passive: false });
    canvas.addEventListener("pointerup", handleMouseUp, { passive: false });
    canvas.addEventListener("pointercancel", handleMouseUp, { passive: false });

    return () => {
      socket.emit("leave", { roomId: room });

      canvas.removeEventListener("pointerdown", handleMouseDown);
      canvas.removeEventListener("pointermove", handleMouseMove);
      canvas.removeEventListener("pointerup", handleMouseUp);
      canvas.removeEventListener("pointercancel", handleMouseUp);

      socket.off("draw_line");
      socket.off("recvmsg");
      socket.off("alert");
    };
  }, [room]);

  const handleChange = () => {
    if (!input.trim()) return;

    if (chat) {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const msg = {
        name: userId,
        msg: input,
        time: timeString,
        roomId: room,
      };
      setMssg((prevmsg) => [...prevmsg, msg]);
      socket.emit("sendmsg", msg);
      setInput('');
    } else {
      setAi((a) => [...a, { input, output: '' }]);
      handleRequest(input);
      setInput('');
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = canvas.getContext("2d");
    a.clearRect(0, 0, canvas.width, canvas.height);
    a.fillStyle = "#ffffff";
    a.fillRect(0, 0, canvas.width, canvas.height);
    setAlert(false);
  };

  const hand = () => {
    socket.emit("clear", { alert: true, roomId: room });
  };

  const handleClearBoard = () => {
    clear();
    hand();
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full border-2 border-gray-200 bg-white cursor-crosshair rounded-lg shadow-sm"
        style={{ touchAction: 'none' }}
      />

      <ResizeAlert />

      <div className="absolute top-4 left-4 flex gap-4 items-center bg-white p-4 rounded-xl shadow-lg border z-20">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Size:</label>
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
          <span className="text-sm font-medium text-gray-700">{brushSize}px</span>
        </div>

        <button onClick={handleClearBoard} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">Clear Board</button>
      </div>

      <div className="absolute top-20 left-4 w-[25%] z-10">
        <WebRTCAppAutomated room={room} />
      </div>

      <button onClick={handleAi} className="absolute top-4 right-[21.5rem] bg-gray-600 text-white px-4 py-2 rounded-xl z-50 shadow-lg hover:bg-gray-700 transition-colors font-medium">
        {chat ? "Switch to AI" : "Switch to Chat"}
      </button>

      <div className="absolute right-4 top-4 bg-white w-80 h-[calc(100vh-2rem)] flex flex-col rounded-xl shadow-2xl border z-50">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-gray-600 text-sm font-medium">
              Welcome <span className="text-gray-800 font-bold">{userId}</span> - <span className="text-purple-600 font-bold">{room}</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
          {chat ?
            [...mssg].reverse().map((a, id) => (
              <div key={id} className={`max-w-[90%] ${a.name === userId ? 'self-end bg-blue-100 border-blue-300' : 'self-start bg-gray-50 border-gray-200'} rounded-xl p-3 border shadow-sm`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold ${a.name === userId ? 'text-blue-700' : 'text-green-600'}`}>{a.name === userId ? 'You' : a.name}</span>
                  <span className="text-xs text-gray-500">{a.time}</span>
                </div>
                <p className="text-sm text-gray-800 break-words">{a.msg}</p>
              </div>
            )).reverse()
            :
            [...ai].reverse().map((a, id) => (
              <React.Fragment key={id}>
                <div className="self-start max-w-[90%] bg-green-50 border-green-200 rounded-xl p-3 border shadow-sm">
                  <p className="text-sm font-bold text-green-700 mb-1">AI</p>
                  <p className="text-sm text-gray-800 break-words">
                    {a.output || (loading && id === ai.length - 1 ? "Thinking..." : "...")}
                  </p>
                </div>
                <div className="self-end max-w-[90%] bg-blue-100 border-blue-300 rounded-xl p-3 border shadow-sm">
                  <p className="text-sm font-bold text-blue-700 mb-1">You</p>
                  <p className="text-sm text-gray-800 break-words">{a.input}</p>
                </div>
              </React.Fragment>
            )).reverse()
          }
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChange(); }}
              placeholder={chat ? "Type your message..." : "Ask the AI a question..."}
              disabled={!chat && loading}
            />
            <button
              onClick={handleChange}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${!chat && loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              disabled={!chat && loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Clear Drawing Board ⚠️</h3>
            <p className="text-gray-600 mb-6">A collaborator has requested to clear the board. Do you wish to proceed?</p>
            <div className="flex gap-4 mt-4 justify-end">
              <button onClick={() => setAlert(false)} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">Cancel</button>
              <button onClick={clear} className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Yes, Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasBoard;