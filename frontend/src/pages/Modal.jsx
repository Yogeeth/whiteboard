import React, { useState } from "react";
import { Users, Plus, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Modal() {
  const [isCreate, setIsCreate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nav=useNavigate()
  // State for Create Room form
  const [createRoom, setCreateRoom] = useState({
    roomName: "",
    hostName: "",
  });

  // State for Join Room form
  const [joinRoom, setJoinRoom] = useState({
    roomName: "",
    userName: "",
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (isCreate) {
      if (!createRoom.roomName.trim()) {
        newErrors.roomName = "Room name is required";
      } else if (createRoom.roomName.length < 3) {
        newErrors.roomName = "Room name must be at least 3 characters";
      }
      
      if (!createRoom.hostName.trim()) {
        newErrors.hostName = "Host name is required";
      } else if (createRoom.hostName.length < 2) {
        newErrors.hostName = "Host name must be at least 2 characters";
      }
    } else {
      if (!joinRoom.roomName.trim()) {
        newErrors.roomName = "Room name is required";
      }
      
      if (!joinRoom.userName.trim()) {
        newErrors.userName = "User name is required";
      } else if (joinRoom.userName.length < 2) {
        newErrors.userName = "User name must be at least 2 characters";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateRoom((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinRoom((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isCreate) {
        
        nav(`/whiteboard/${createRoom.roomName}/${createRoom.hostName}`)
        // your API call / socket emit for creating room
      } else {
        
        nav(`/whiteboard/${createRoom.roomName}/${createRoom.hostName}`)
        // your API call / socket emit for joining room
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setIsCreate(mode);
    setErrors({});
  };

  return (
    <div className="relative">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl transform scale-110"></div>
      
      {/* Main modal */}
      <div className="relative p-8 rounded-2xl shadow-2xl w-96 bg-gradient-to-br from-slate-900/95 to-slate-800/95 text-white backdrop-blur-lg border border-slate-700/50 z-50">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isCreate ? "Create Room" : "Join Room"}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isCreate ? "Start a new conversation" : "Connect with others"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {isCreate ? (
            <>
              <div className="space-y-2">
                <input
                  type="text"
                  name="roomName"
                  placeholder="Room Name"
                  value={createRoom.roomName}
                  onChange={handleCreateChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400 ${
                    errors.roomName ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.roomName && (
                  <div className="flex items-center gap-1 text-red-400 text-sm animate-in slide-in-from-left-2 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.roomName}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  name="hostName"
                  placeholder="Your name / host"
                  value={createRoom.hostName}
                  onChange={handleCreateChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400 ${
                    errors.hostName ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.hostName && (
                  <div className="flex items-center gap-1 text-red-400 text-sm animate-in slide-in-from-left-2 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.hostName}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <input
                  type="text"
                  name="roomName"
                  placeholder="Enter Room Name"
                  value={joinRoom.roomName}
                  onChange={handleJoinChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400 ${
                    errors.roomName ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.roomName && (
                  <div className="flex items-center gap-1 text-red-400 text-sm animate-in slide-in-from-left-2 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.roomName}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  name="userName"
                  placeholder="Your name"
                  value={joinRoom.userName}
                  onChange={handleJoinChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400 ${
                    errors.userName ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.userName && (
                  <div className="flex items-center gap-1 text-red-400 text-sm animate-in slide-in-from-left-2 duration-200">
                    <AlertCircle className="w-4 h-4" />
                    {errors.userName}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Toggle buttons */}
        <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
          <button
            onClick={() => switchMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              isCreate 
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              !isCreate 
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Join
          </button>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {isCreate ? "Creating..." : "Joining..."}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {isCreate ? <Plus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isCreate ? "Create Room" : "Join Room"}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}