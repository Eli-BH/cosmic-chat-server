const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    max: 20,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  roomAdmin: {
    type: Array,
    default: [],
  },
  userImage: {
    type: String,
    default: "https://i.imgur.com/61ENNhU.png",
  },
});

module.exports = mongoose.model("User", userSchema);

//User info
//username
//email
//password
//rooms where admin
