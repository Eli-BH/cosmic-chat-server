require("dotenv").config();

const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

//Auth Routes

//Create a new User: POST
router.post("/register", async (req, res) => {
  try {
    //check if the user exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(409).send("User with that email already exists");

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    //create the new user
    const user = await new User({
      email: req.body.email,
      username: req.body.username,
      password: hashedPass,
    });
    await user.save();

    //create a JWT for the user
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET);

    //return the new user access token
    res.status(201).send(accessToken);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//Login a user
router.post("/login", async (req, res) => {
  try {
    //look for the user in the DB
    const user = await User.findOne({ email: req.body.email });

    //if no user, return 404 user not found
    if (!user) return res.status(404).send("404 user not found");

    //check the password
    const validPass = await bcrypt.compare(req.body.password, user.password);

    //if password is valid, send token
    if (validPass) {
      const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).send(accessToken);
    } else {
      res.status(500).send("Incorrect Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//Delete User
router.post("/login", async (req, res) => {
  try {
    //look for the user in the DB
    const user = await User.findOne({ email: req.body.email });

    //if no user, return 404 user not found
    if (!user) return res.status(404).send("User not found");
    //check the password
    const validPass = await bcrypt.compare(req.body.password, user.password);

    //if password is valid, send token
    if (validPass) {
      await User.findOneAndDelete({ email: req.body.email });
      res.status(200).send("User Deleted");
    } else {
      res.status(500).send("Incorrect Credentials");
    }
  } catch (error) {}
});

module.exports = router;
