require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const socket = require("socket.io");
const authRoutes = require("./routers/authRouter");
const userRoutes = require("./routers/userRouter");
const roomRoutes = require("./routers/roomRouter");

//middleware
app.use(cors());
app.use(express.json());

//app routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);

//test route
app.get("/", (req, res) => {
  res.send("Server running");
});

//connect to mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => console.log(error));

//server start
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

//connect through socketIO
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let currentUsers = {};

io.on("connection", (socket) => {
  //random id from socket io
  console.log(socket.id, "User connected");

  socket.on("joinRoom", (data) => {
    socket.join(data.roomName);
    let userObj = {
      username: data.username,
      id: socket.id,
    };
    if (!currentUsers[data.roomName]) {
      currentUsers[data.roomName] = [];
      let existingUser = currentUsers[data.roomName].find(
        (user) => user.username === data.username
      );
      if (!existingUser) {
        currentUsers[data.roomName].push(userObj);
      }
    } else {
      let existingUser = currentUsers[data.roomName].find(
        (user) => user.username === data.username
      );
      if (!existingUser) {
        currentUsers[data.roomName].push(userObj);
      }
    }

    // currentUsers = currentUsers[data.roomName].filter(
    //   (obj) => obj.username !== undefined
    // );

    console.log(`User has entered ${data.roomName} room.`);
    console.log(currentUsers);
  });

  socket.on("sendMessage", (data) => {
    console.log(data);
    socket.to(data.room).emit("receiveMessage", data.content);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");

    for (const item in currentUsers) {
      currentUsers[item] = currentUsers[item].filter(
        (obj) => obj.id != socket.id
      );
    }
    console.log(currentUsers);
  });
});
