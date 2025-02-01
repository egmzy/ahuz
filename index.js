import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { questions } from "./questions.js";

const rooms = {};
const players = [];
var i = 0;

const app = express();
const server = createServer(app);
const io = new Server(server);
var randomized = [];

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  socket.on("new-room", () => {
    // const roomNumber = Math.floor(Math.random() * 900) + 100;
    const roomNumber = 1; // temp
    rooms[roomNumber] = [];
    socket.join(roomNumber.toString());
    socket.emit("room-created", roomNumber);
  });

  socket.on("join-room", ({ playerName, roomNumber }) => {
    if (!rooms[roomNumber]) rooms[roomNumber] = [];
    rooms[roomNumber].push(playerName);
    socket.join(roomNumber.toString());
    io.to(roomNumber.toString()).emit("joined-room", roomNumber);
    io.to(roomNumber.toString()).emit("player-list", rooms[roomNumber]);
    players.push({
      name: playerName,
      score: 0,
    });
  });

  socket.on("start-game", (roomNumber) => {
    randomized = shuffleArray(questions);
    io.to(roomNumber.toString()).emit("game-started", randomized[i]);
  });

  socket.on("send-answer", (data) => {
    const { currentRoom, currentPlayerName, answer } = data;
    const playerIndex = players.findIndex((p) => p.name === currentPlayerName);
    if (playerIndex !== -1) {
      const correctAnswer = randomized[i].answer;
      const distance = Math.abs(correctAnswer - parseInt(answer));
      players[playerIndex].score += distance;
      io.to(currentRoom.toString()).emit("answered", {
        playerName: currentPlayerName,
        answerFromServer: answer,
      });
    }
  });

  socket.on("show-answer", (roomNumber) => {
    io.to(roomNumber.toString()).emit("answer-shown", { players });
  });

  socket.on("next-question", (roomNumber) => {
    i = i + 1;
    io.to(roomNumber.toString()).emit("showing-next-question", randomized[i]);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
