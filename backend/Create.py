from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///rooms.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    room_id = db.Column(db.String(36), nullable=False, index=True)
    room_name = db.Column(db.String(100), nullable=False)
    host = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
with app.app_context():
    db.create_all()


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
    return jsonify({"message": "Room created", "roomId": room_id,'name':name,'roomName':room_name}), 201


@app.route("/join_room", methods=["POST"])
def join_room():
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

if __name__ == "__main__":
    app.run(debug=True, port=8000)
