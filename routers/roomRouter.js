const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../modules/User");

//route to for a new room
//adds the user as admin by username

router.post("/new_room", async (req, res) => {
  try {
    const existingRoom = await Room.findOne({ name: req.body.roomName });

    if (existingRoom) return res.status(409).send("Room already exists");

    const newRoom = await new Room({
      name: req.body.roomName,
      admin: req.body.user,
    });

    newRoom.save();

    res.status(201).json(newRom);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//route to get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({});
    if (!rooms) res.status(404).send("No rooms found");

    res.status(200).json(rooms);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
