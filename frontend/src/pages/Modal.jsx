import React, { useState } from "react";
import { Users, Plus, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Modal() {
  const [isCreate, setIsCreate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nav = useNavigate();

  // State for Create Room form
  const [createRoom, setCreateRoom] = useState({
    roomName: "",
    name: "",
  });

  // State for Join Room form
  const [joinRoom, setJoinRoom] = useState({
    roomId: "",
    name: "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (isCreate) {
      if (!createRoom.roomName.trim()) {
        newErrors.roomName = "Room name is required";
      } else if (createRoom.roomName.length < 3) {
        newErrors.roomName = "Room name must be at least 3 characters";
      }

      if (!createRoom.name.trim()) {
        newErrors.name = "Host name is required";
      } else if (createRoom.name.length < 2) {
        newErrors.name = "Host name must be at least 2 characters";
      }
    } else {
      if (!joinRoom.roomId.trim()) {
        newErrors.roomId = "Room ID is required";
      }

      if (!joinRoom.name.trim()) {
        newErrors.name = "Your name is required";
      } else if (joinRoom.name.length < 2) {
        newErrors.name = "Your name must be at least 2 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateRoom((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinRoom((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let response;
      if (isCreate) {
        response = await fetch("http://127.0.0.1:5000/create_room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createRoom),
        });
      } else {
        response = await fetch("http://127.0.0.1:5000/join_room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(joinRoom),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      // Navigate to whiteboard with correct params
      nav(`/whiteboard/${data.name}/${data.roomId}/${data.roomName}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl transform scale-110"></div>

      <div className="relative p-8 rounded-2xl shadow-2xl w-96 bg-gradient-to-br from-slate-900/95 to-slate-800/95 text-white backdrop-blur-lg border border-slate-700/50 z-50">
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
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border ${
                    errors.roomName ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.roomName && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.roomName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name / host"
                  value={createRoom.name}
                  onChange={handleCreateChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border ${
                    errors.name ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <input
                  type="text"
                  name="roomId"
                  placeholder="Enter Room ID"
                  value={joinRoom.roomId}
                  onChange={handleJoinChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border ${
                    errors.roomId ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.roomId && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.roomId}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={joinRoom.name}
                  onChange={handleJoinChange}
                  className={`w-full p-3 rounded-lg bg-slate-800/50 border ${
                    errors.name ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
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
            className={`flex-1 px-4 py-2 rounded-md ${
              isCreate
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4 inline" /> Create
          </button>
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 px-4 py-2 rounded-md ${
              !isCreate
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4 inline" /> Join
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium"
        >
          {isLoading ? (isCreate ? "Creating..." : "Joining...") : isCreate ? "Create Room" : "Join Room"}
        </button>
      </div>
    </div>
  );
}
