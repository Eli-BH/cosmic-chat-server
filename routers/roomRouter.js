const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../modules/User");

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

module.exports = router;
