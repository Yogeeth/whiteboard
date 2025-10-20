from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import google.generativeai as genai
import uuid
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///rooms.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# SocketIO configuration
socketio = SocketIO(app, cors_allowed_origins="*")

# Gemini AI configuration
api_key = os.getenv("GEMINI_API_KEY")  # Set your API key in environment


# Database Model
class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    room_id = db.Column(db.String(36), nullable=False, index=True)
    room_name = db.Column(db.String(100), nullable=False)
    host = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)


with app.app_context():
    db.create_all()

@app.route("/")
def index():
    return "Combined Flask Backend (Room Management + WebRTC + Whiteboard) is running!"


@app.route("/create_room", methods=["POST"])
def create_room():
    data = request.json
    room_id = str(uuid.uuid4())
    room_name = data.get("roomName")
    name = data.get("name")

    # Create room
    new_room = Room(
        room_id=room_id,
        room_name=room_name,
        name=name,
        host=True
    )
    db.session.add(new_room)
    db.session.commit()
    return jsonify({
        "message": "Room created",
        "roomId": room_id,
        'name': name,
        'roomName': room_name
    }), 201


@app.route("/join_room", methods=["POST"])
def join_room_api():
    data = request.json
    room_id = data.get("roomId")
    name = data.get("name")

    # Find the original host room entry
    room = Room.query.filter_by(room_id=room_id, host=True).first()
    if not room:
        return jsonify({"error": "Room not found"}), 404

    # Add new participant
    new_room = Room(
        room_id=room_id,
        room_name=room.room_name,
        name=name,
        host=False
    )
    db.session.add(new_room)
    db.session.commit()

    return jsonify({
        "message": "Joined room",
        "roomId": room_id,
        "name": name,
        "roomName": room.room_name
    }), 201


@app.route('/api/ai-req', methods=['POST'])
def answer():
    data = request.get_json()
    genai.configure(api_key=api_key)
    gemini = genai.GenerativeModel("gemini-1.5-flash")
    print("Sending req to Gemini:", data)
    response = gemini.generate_content(data.get('input'))
    output_text = response.text.replace("*", "")
    return jsonify({"output": output_text})


# SocketIO Event Handlers

@socketio.on("connect")
def handle_connect():
    print("User connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("User disconnected")


# WebRTC Events
@socketio.on("join-room")
def handle_join_webrtc(data):
    room = data.get("room")
    if room:
        join_room(room)
        print(f"User joined WebRTC room: {room}")


@socketio.on("offer")
def handle_offer(data):
    room = data.get("room")
    offer = data.get("offer")
    emit("offer", offer, room=room, include_self=False)


@socketio.on("answer")
def handle_answer(data):
    room = data.get("room")
    answer = data.get("answer")
    emit("answer", answer, room=room, include_self=False)


@socketio.on("ice-candidate")
def handle_ice(data):
    room = data.get("room")
    candidate = data.get("candidate")
    emit("ice-candidate", {"candidate": candidate}, room=room, include_self=False)


# Whiteboard Events
@socketio.on("join")
def handle_join_whiteboard(data):
    room_id = data.get("roomId")
    join_room(room_id)
    print(f"User joined whiteboard room {room_id}")


@socketio.on("leave")
def handle_leave(data):
    room_id = data.get("roomId")
    leave_room(room_id)
    print(f"User left room {room_id}")


@socketio.on("draw_line")
def handle_draw(data):
    room_id = data.get("roomId")
    emit("draw_line", data, room=room_id, include_self=False)


@socketio.on("sendmsg")
def handle_msg(data):
    room_id = data.get("roomId")
    emit("recvmsg", data, room=room_id, include_self=False)


@socketio.on("clear")
def handle_clear(data):
    room_id = data.get("roomId")
    emit("alert", data, room=room_id, include_self=False)


if __name__ == "__main__":
    print("Server running at http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)