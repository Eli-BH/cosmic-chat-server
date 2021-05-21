require("dotenv").config();
const User = require("../models/User");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    //look for the user
    let user = await User.findOne({ email: req.user.email });
    const { password, ...info } = user._doc;

    res.status(200).json(info);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.status(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, { user }) => {
    if (err) return res.status(403);

    req.user = user;
    next();
  });
}

module.exports = router;
