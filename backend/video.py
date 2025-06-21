from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return "WebRTC Flask backend running!"

@socketio.on("connect")
def on_connect():
    print("Anala connected")

@socketio.on("disconnect")
def on_disconnect():
    print("Anala disconnected")

@socketio.on("join-room")
def handle_join(data):
    room = data.get("room")
    if room:
        join_room(room)
        print(f"Anala joined room: {room}")

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
    emit("ice-candidate", { "candidate": candidate }, room=room, include_self=False)

if __name__ == "__main__":
    print("Starting Flask WebRTC server at http://localhost:5001")
    socketio.run(app, host="0.0.0.0", port=5001,debug=True)
