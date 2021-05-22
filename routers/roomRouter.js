const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../models/User");

const upload = require("../services/ImageUpload");
const singleUpload = upload.single("image");

//route to for a new room
//adds the user as admin by username

router.post("/new_room", async (req, res) => {
  try {
    const existingRoom = await Room.findOne({ name: req.body.roomName });

    //check if the room exists already
    if (existingRoom) return res.status(409).send("Room already exists");

    //create a new room
    const newRoom = await new Room({
      roomName: req.body.roomName,
      admin: req.body.username,
    });

    //look for the user by username
    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(404).send("User not found");

    await user.updateOne({
      $push: {
        roomAdmin: req.body.roomName,
      },
    });

    await newRoom.save();

    res.status(201).json(newRoom);
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
    const user = await User.findOne({ username: req.body.username });

    //check if user is not admin
    if (room.admin !== user.username)
      return res.status(401).send("Not authorized");

    //delete the room if admin

    await Room.findOneAndDelete({ name: req.body.roomName });

    //take room from users admin array
    await user.updateOne({
      $pull: {
        roomAdmin: room.roomName,
      },
    });

    //send success message
    res.status(200).send("Room deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/current_room/:roomName", async (req, res) => {
  try {
    //find the room
    const room = await Room.findOne({ roomName: req.params.roomName });
    //check if room exists
    if (!room) return res.status(404).send("room not found");

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

//route to enter the currentUser array

router.put("/enter_room", async (req, res) => {
  try {
    //find the room
    const room = await Room.findOne({ roomName: req.body.roomName });

    //return if the room is not found
    if (!room) return res.status(404).send("No room with that name");

    //add user to current users array

    if (!room.currentUsers.includes(req.body.username))
      room.currentUsers.push(req.body.username);

    await room.save();
    //return the room object
    //will de-structure the room array from it.
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

//route to exit the currentUser array
router.put("/exit_room", async (req, res) => {
  try {
    //find the room
    const room = await Room.findOne({ name: req.body.roomName });

    //return if the room is not found
    if (!room) return res.status(404).send("No room with that name");

    //pull user from current users array
    await room.updateOne({
      $pull: {
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

router.post("/new_message", async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ roomName: req.body.roomName });

    await currentRoom.updateOne({
      $push: {
        messages: {
          text: req.body.text,
          author: req.body.author,
          time: Date.now(),
        },
      },
    });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.get("/messages/:room", async (req, res) => {
  try {
    const room = await Room.findOne({ roomName: req.params.room });

    const messages = room.messages || [];

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

//make a post with an image
router.post("/new_img_message", async (req, res) => {
  try {
    singleUpload(req, res, async (err) => {
      if (err) {
        return res.json({
          success: false,
          errors: {
            title: "Image Upload Error",
            detail: err.message,
            error: err,
          },
        });
      }

      const currentRoom = await Room.findOne({ roomName: req.body.roomName });

      await currentRoom.updateOne({
        $push: {
          messages: {
            text: req.body.text,
            author: req.body.author,
            img: req.file.location,
            time: Date.now(),
          },
        },
      });

      currentRoom.save();

      console.log(req.body);
      res.status(200).json(req.file.location);
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
