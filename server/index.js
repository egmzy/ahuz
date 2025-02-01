import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { questions } from "./questions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

const rooms = {};
const players = [];
let questionIndex = 0;
let randomized = [];

io.on("connection", (socket) => {
  socket.on("newRoom", () => {
    const roomNumber = 1; // temporary room number for testing
    rooms[roomNumber] = [];
    socket.join(roomNumber.toString());
    socket.emit("roomCreated", roomNumber);
  });

  socket.on("joinRoom", ({ playerName, roomNumber }) => {
    if (!rooms[roomNumber]) rooms[roomNumber] = [];
    rooms[roomNumber].push(playerName);
    socket.join(roomNumber.toString());
    io.to(roomNumber.toString()).emit("joinedRoom", roomNumber);
    io.to(roomNumber.toString()).emit("playerList", rooms[roomNumber]);
    players.push({ name: playerName, score: 0 });
  });

  socket.on("startGame", (roomNumber) => {
    randomized = shuffleArray([...questions]);
    questionIndex = 0;
    io.to(roomNumber.toString()).emit("gameStarted", randomized[questionIndex]);
  });

  socket.on("sendAnswer", (data) => {
    const { currentRoom, currentPlayerName, answer } = data;
    const playerIndex = players.findIndex((p) => p.name === currentPlayerName);
    if (playerIndex !== -1) {
      const correctAnswer = randomized[questionIndex].answer;
      const distance = Math.abs(correctAnswer - parseInt(answer, 10));
      players[playerIndex].score += distance;
      io.to(currentRoom.toString()).emit("answered", {
        playerName: currentPlayerName,
        answerFromServer: answer,
      });
    }
  });

  socket.on("showAnswer", (roomNumber) => {
    io.to(roomNumber.toString()).emit("answerShown", { players });
  });

  socket.on("nextQuestion", (roomNumber) => {
    questionIndex++;
    if (questionIndex < randomized.length) {
      io.to(roomNumber.toString()).emit(
        "showingNextQuestion",
        randomized[questionIndex]
      );
    } else {
      io.to(roomNumber.toString()).emit("gameEnded", { players });
    }
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
