# server.py
from flask import Flask,request,jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import google.generativeai as genai
import os
api = os.getenv("GEMINI_API_KEY")
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return "Whiteboard backend is running"

@app.route('/api/ai-req', methods=['POST'])
def answer():
    data = request.get_json()
    
    
    genai.configure(api_key=api)

    gemini = genai.GenerativeModel("gemini-1.5-flash")

    print("Sending req to Gemini:", data)
    
    # Send input to Gemini
    response = gemini.generate_content(data.get('input'))
    
    output_text = response.text.replace("*", "")
    
    print("Output:", output_text)

    return jsonify({
        "output": output_text
    })



@socketio.on("connect")
def handle_connect():
    print("Anala connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Anala disconnected")

@socketio.on("draw_line")
def handle_draw(data):
    print(f"Drawing data received: {data}")
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
    print("Server starting on http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000,debug=True)

