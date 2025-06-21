
import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
import ResizeAlert from "./resize";
import WebRTCApp from "./vid";

const socket = io("http://localhost:5000");

const CanvasBoard = () => {
  const { userId, room } = useParams();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const colorRef = useRef("#000000");
  const sizeref = useRef(4);

  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [mssg, setMssg] = useState([]);
  const [ai, setAi] = useState([]);
  const [chat, setChat] = useState(true);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (input) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai-req", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      console.log(data['output']);

      setAi((prevAi) => {
        const updated = [...prevAi];
        updated[updated.length - 1].output = data.output;
        return updated;
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    colorRef.current = color;
    sizeref.current = brushSize;
  }, [color, brushSize]);

  const handleAi = () => setChat((a) => !a);

  useEffect(() => {
    const canvas = canvasRef.current;
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getMousePos(e);
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const currentPos = getMousePos(e);
      const { x, y } = lastPosRef.current;
      ctx.lineCap = "round";
      ctx.lineWidth = sizeref.current;
      ctx.strokeStyle = colorRef.current;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      socket.emit("draw_line", {
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
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    socket.on("recvmsg", (msg) => setMssg((a) => [...a, msg]));
    socket.on("alert", ({ alert }) => alert && setAlert(true));

    canvas.addEventListener("pointerdown", handleMouseDown, { passive: false });
    canvas.addEventListener("pointermove", handleMouseMove, { passive: false });
    canvas.addEventListener("pointerup", handleMouseUp, { passive: false });
    canvas.addEventListener("pointercancel", handleMouseUp, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", handleMouseDown);
      canvas.removeEventListener("pointermove", handleMouseMove);
      canvas.removeEventListener("pointerup", handleMouseUp);
      canvas.removeEventListener("pointercancel", handleMouseUp);
    };
  }, []);

  const handleChange = () => {
    if (chat) {
      const now = new Date();
      const msg = {
        name: userId,
        msg: input,
        time: `${now.getHours()}:${now.getMinutes()}`,
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
    const a = canvas.getContext("2d");
    a.clearRect(0, 0, canvas.width, canvas.height);
    a.fillStyle = "#ffffff";
    a.fillRect(0, 0, canvas.width, canvas.height);
    setAlert(false);
  };

  const hand = () => socket.emit("clear", { alert: true });

  return (
    <div className="relative w-full h-screen bg-gray-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full border-2 border-gray-200 bg-white cursor-crosshair rounded-lg shadow-sm"
        style={{ touchAction: 'none' }}
      />

      <ResizeAlert />

      <div className="absolute top-4 left-4 flex gap-4 items-center bg-white p-4 rounded-xl shadow-lg border">
        <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-12 h-12 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
      />
    </div>

        <label>Size:</label>
        <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />

        <button onClick={() => { clear(); hand(); }} className="bg-red-500 text-white px-4 py-2 rounded">Clear</button>
      </div>

      <div className="absolute top-20 w-[25%]">
        <WebRTCApp room={room} />
      </div>

      <button onClick={handleAi} className="absolute top-6 right-6 bg-gray-600 text-white p-2 rounded-xl z-50">Chat / AI</button>

      <div className="absolute right-4 top-4 bg-white w-80 h-[calc(100vh-2rem)] flex flex-col rounded-xl shadow-lg border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-gray-600 text-sm font-medium">
          Welcome <span className="text-gray-800 font-semibold">{userId}</span>
        </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chat ? mssg.map((a, id) => (
            <div key={id} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-blue-600">{a.name}</span>
                <span className="text-xs text-gray-500">{a.time}</span>
              </div>
              <p className="text-sm text-gray-800">{a.msg}</p>
            </div>
          )) : ai.map((a, id) => (
            <div key={id} className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-purple-700 text-sm font-semibold">You</p>
              <p className="text-sm text-gray-800 mb-2">{a.input}</p>
              <p className="text-green-700 text-sm font-semibold">AI</p>
              <p className="text-sm text-gray-800">{a.output || (loading && id === ai.length - 1 ? "Thinking..." : "")}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input className="flex-1 border rounded p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
            <button onClick={handleChange} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
          </div>
        </div>
      </div>

      {alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold">Clear Drawing Board</h3>
            <p>Your friend wants to clear the board. Do you wish to proceed?</p>
            <div className="flex gap-4 mt-4 justify-end">
              <button onClick={clear} className="bg-red-500 text-white px-4 py-2 rounded">Yes, Clear</button>
              <button onClick={() => setAlert(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasBoard;
