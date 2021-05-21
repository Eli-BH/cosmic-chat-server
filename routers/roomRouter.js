const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../modules/User");

//route to for a new room
//adds the user as admin by username

router.post("/new_room", async (req, res) => {
  try {
    const existingRoom = await Room.findOne({ name: req.body.roomName });

    //check if the room exists already
    if (existingRoom) return res.status(409).send("Room already exists");

    //create a new room
    const newRoom = await new Room({
      name: req.body.roomName,
      admin: req.body.username,
    });

    //add the admins to the users array
    await newRoom.updateOne({
      $push: {
        currentUsers: req.body.username,
      },
    });

    await newRoom.save();

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

//route to delete a room
router.delete("/", async (req, res) => {
  try {
    //get room
    const room = await Room.findOne({ name: req.body.roomName });

    //user
    const user = req.body.username;

    //check if user is not admin
    if (room.admin !== user) return res.status(401).send("Not authorized");

    //delete the room if admin

    await Room.findOneAndDelete({ name: req.body.roomName });

    //send success message
    res.status(200).send("Room deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/messages/:roomName", async (req, res) => {
  try {
    //find the room
    const room = await Room.findOne({ name: req.params.roomName });
    //get the messages array
    const messages = room.messages || [];

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.patch("/enter_room", async (req, res) => {
  try {
    //find the room
    const room = await Room.findOne({ name: req.body.roomName });

    //return if the room is not found
    if (!room) return res.status(404).send("No room with that name");

    //add user to current users array
    await room.updateOne({
      $push: {
        currentUsers: req.body.username,
      },
    });

    await room.save();
    //return the room object
    //will de-structure the room array from it.
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

module.exports = router;
