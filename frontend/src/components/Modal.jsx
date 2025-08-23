import React, { useState } from "react";

export default function Modal() {
  const [isCreate, setIsCreate] = useState(true);

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

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isCreate) {
      console.log("Creating Room:", createRoom);
      // your API call / socket emit for creating room
    } else {
      console.log("Joining Room:", joinRoom);
      // your API call / socket emit for joining room
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-2xl w-96 bg-neutral-900 text-white backdrop-blur-md z-50">
    
      {isCreate ? (
        <div className="space-y-3">
          <input
            type="text"
            name="roomName"
            placeholder="Room Name"
            value={createRoom.roomName}
            onChange={handleCreateChange}
            className="w-full p-2 rounded bg-neutral-800"
          />
          <input
            type="text"
            name="hostName"
            placeholder="Your name / host"
            value={createRoom.hostName}
            onChange={handleCreateChange}
            className="w-full p-2 rounded bg-neutral-800"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            name="roomName"
            placeholder="Enter Room Name"
            value={joinRoom.roomName}
            onChange={handleJoinChange}
            className="w-full p-2 rounded bg-neutral-800"
          />
          <input
            type="text"
            name="userName"
            placeholder="Your name"
            value={joinRoom.userName}
            onChange={handleJoinChange}
            className="w-full p-2 rounded bg-neutral-800"
          />
        </div>
      )}

      {/* Toggle buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setIsCreate(true)}
          className={`px-4 py-2 rounded ${
            isCreate ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => setIsCreate(false)}
          className={`px-4 py-2 rounded ${
            !isCreate ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          Join Room
        </button>
      </div>

      {/* Submit button */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-blue-600 rounded"
        >
          {isCreate ? "Create" : "Join"}
        </button>
      </div>
    </div>
  );
}
