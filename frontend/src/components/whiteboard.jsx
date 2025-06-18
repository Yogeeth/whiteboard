import React, { useRef, useEffect, useState } from "react";

import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); 
import { useParams } from 'react-router-dom';
import ResizeAlert from "./resize";

const CanvasBoard = () => {
  const { userId } = useParams();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false); 
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [lines, setLines] = useState([]);
  const [input,setInput] = useState('')
  const [mssg,setMssg] = useState([

  ])
  const colorRef = useRef("#000000")
  const sizeref = useRef(4)

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);

  const [alert,setAlert] = useState(false)
  

  useEffect(()=>{
    colorRef.current = color
    sizeref.current=brushSize
  },[color,brushSize])

  useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    // Save current drawing
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Update canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fill background again
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore previous drawing
    ctx.putImageData(imgData, 0, 0);
  };

  // Initial setup
  resizeCanvas();

  // Listen for resize
  window.addEventListener("resize", resizeCanvas);

  return () => {
    window.removeEventListener("resize", resizeCanvas);
  };
}, []);



  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    // ctx.lineCap = "round";
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    // FIXED: Better coordinate calculation for tablets
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const handleMouseDown = (e) => {
      e.preventDefault(); // ADDED: Prevent default behavior
      isDrawingRef.current = true;
      lastPosRef.current = getMousePos(e);
    };

    const handleMouseMove = (e) => {
      e.preventDefault(); // ADDED: Prevent default behavior
      if (!isDrawingRef.current) return;
      const ctx = canvas.getContext("2d");
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
        color:colorRef.current,
        brushSize:sizeref.current,
    });

      lastPosRef.current = currentPos;
    };

    const handleMouseUp = (e) => {
      e.preventDefault(); // ADDED: Prevent default behavior
      isDrawingRef.current = false;
    };
    console.log(mssg)
    socket.on("draw_line", ({ from, to, color, brushSize }) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        console.log(from,color)
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    });

    socket.on("recvmsg",(
        msg
    )=>{

        
        setMssg((a)=>[...a,msg])
    })

    socket.on("alert",({alert})=>{
      console.log(alert)
      if(alert){
        setAlert(alert)
      }
    })


    // CHANGED: Added { passive: false } for preventDefault to work
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

  const handleChange=()=>{
    console.log("anala",input)
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    const msg={
        name:userId,
        msg:input,
        time:`${hours}:${minutes}`
    }
    

    setMssg((prevmsg)=>[...prevmsg,msg])
    // console.log(mssg)
    socket.emit("sendmsg",msg)
    setInput('')
  }

  const clear=()=>{
    const canvas=canvasRef.current
    const a = canvas.getContext("2d")
    a.clearRect(0,0,canvas.width,canvas.height)
    a.fillStyle="#ffffff"
    a.fillRect(0, 0, canvas.width, canvas.height);
    
    setAlert(false)
  }

  const hand=()=>{
    socket.emit("clear",{alert:true})
  }

  return (
<div className="relative w-full h-screen bg-gray-50">
  <canvas
    ref={canvasRef}
    className="w-full h-full border-2 border-gray-200 bg-white cursor-crosshair rounded-lg shadow-sm"
    style={{ touchAction: 'none' }} // ADDED: Prevent touch scrolling/zooming
  />

  <div>
      <ResizeAlert/>
  </div>
  
  {/* Drawing Controls */}
  <div className="absolute top-4 left-4 flex gap-4 items-center bg-white p-4 rounded-xl shadow-lg border border-gray-100">
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
      <input
        type="range"
        min="1"
        max="20"
        value={brushSize}
        onChange={(e) => setBrushSize(parseInt(e.target.value))}
        className="w-32 accent-blue-500"
      />
      <span className="text-sm text-gray-600 min-w-[2rem]">{brushSize}px</span>
    </div>
    
    <button
      onClick={()=>{clear(),hand()}}
      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
    >
      Clear
    </button>
  </div>

  {/* Chat Panel */}
  <div className="absolute right-4 top-4 bg-white w-80 h-[calc(100vh-2rem)] flex flex-col rounded-xl shadow-lg border border-gray-200">
    
    {/* Chat Header */}
    <div className="bg-gray-800 text-white p-4 rounded-t-xl">
      <h3 className="font-semibold text-lg">Chat</h3>
    </div>

    <div className="rounded-lg px-4 py-3 mb-3">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
        <span className="text-gray-600 text-sm font-medium">
          Welcome <span className="text-gray-800 font-semibold">{userId}</span>
        </span>
      </div>
    </div>
    
    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {mssg.map((a, id) => (
        <div key={id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-blue-600 text-sm">{a.name}</span>
            <span className="text-xs text-gray-500">{a.time}</span>
          </div>
          <p className="text-gray-800 text-sm">{a.msg}</p>
        </div>
      ))}
    </div>
    
    {/* Input Area */}
    <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
      <div className="flex gap-2">
        <input 
          placeholder="Type your message..." 
          className="flex-1 rounded-lg p-3 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
          onChange={(a) => setInput(a.target.value)}
          value={input}
        />
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200" 
          onClick={handleChange}
        >
          Send
        </button>
      </div>
    </div>
  </div>

  {/* Modal Alert - Centered with Backdrop */}
  {alert && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Drawing Board</h3>
            <p className="text-gray-600">
              Your friend wants to clear the board. Do you wish to proceed?
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={clear}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Yes, Clear
            </button>
            <button 
              onClick={() => setAlert(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default CanvasBoard;