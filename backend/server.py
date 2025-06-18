# server.py
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 👇 Initialize Socket.IO server with CORS allowed for frontend
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return "Whiteboard backend is running"

@socketio.on("connect")
def handle_connect():
    print("✅ A client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("❌ A client disconnected")

@socketio.on("draw_line")
def handle_draw(data):
    print(f"🎨 Drawing data received: {data}")
    emit("draw_line", data, broadcast=True, include_self=False)

@socketio.on("sendmsg")
def handle_msg(data):
    print("anala",data)
    emit("recvmsg",data,broadcast=True,include_self=False)

@socketio.on("clear")
def handle_clear(data):
    print(data)
    emit('alert',data,broadcast=True,include_self=False)

if __name__ == "__main__":
    print("🚀 Server starting on http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000)

