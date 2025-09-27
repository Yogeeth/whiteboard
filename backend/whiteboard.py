from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import google.generativeai as genai
import os

api_key = os.getenv("GEMINI_API_KEY")  # Set your API key in environment

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return "Whiteboard backend is running"


@app.route('/api/ai-req', methods=['POST'])
def answer():
    data = request.get_json()
    genai.configure(api_key=api_key)
    gemini = genai.GenerativeModel("gemini-1.5-flash")
    print("Sending req to Gemini:", data)
    response = gemini.generate_content(data.get('input'))
    output_text = response.text.replace("*", "")
    return jsonify({"output": output_text})


@socketio.on("connect")
def handle_connect():
    print("User connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("User disconnected")


# Join room
@socketio.on("join")
def handle_join(data):
    room_id = data.get("roomId")
    join_room(room_id)
    print(f"User joined room {room_id}")


# Leave room
@socketio.on("leave")
def handle_leave(data):
    room_id = data.get("roomId")
    leave_room(room_id)
    print(f"User left room {room_id}")


# Draw line in a room
@socketio.on("draw_line")
def handle_draw(data):
    room_id = data.get("roomId")
    emit("draw_line", data, room=room_id, include_self=False)


# Chat in a room
@socketio.on("sendmsg")
def handle_msg(data):
    room_id = data.get("roomId")
    emit("recvmsg", data, room=room_id, include_self=False)


# Clear canvas in a room
@socketio.on("clear")
def handle_clear(data):
    room_id = data.get("roomId")
    emit("alert", data, room=room_id, include_self=False)


if __name__ == "__main__":
    print("Server starting on http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
