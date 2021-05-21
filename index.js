require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const socket = require("socket.io");
const authRoutes = require("./routers/authRouter");
const userRoutes = require("./routers/userRouter");

//middleware
app.use(cors());
app.use(express.json());

//app routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

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

io.on("connection", (socket) => {
  //random id from socket io
  console.log(socket.id, "User connected");
});
