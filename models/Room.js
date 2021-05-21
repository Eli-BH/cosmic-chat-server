const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  messages: {
    type: Array,
    default: [],
  },
  currentUsers: {
    type: Array,
    default: [],
  },
  admin: {
    type: String,
  },
});

module.exports = mongoose.model("Room", roomSchema);

//ROOM
//-roomName
//-message list
// - users List
// Who is admin
