import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { lang } from "./lang.js";

const socket = io();
let currentRoom = 0;
let currentPlayerName = "";

const $ = (id) => document.getElementById(id);

const initTextContent = () => {
  document.title = lang.gameTitle;
  $("gameTitle").textContent = lang.gameTitle;
  $("newRoomBtn").textContent = lang.newRoomBtn;
  $("playerNameInput").setAttribute("placeholder", lang.playerNamePlaceholder);
  $("roomNumberInput").setAttribute("placeholder", lang.roomNumberPlaceholder);
  $("joinRoomBtn").textContent = lang.joinRoomBtn;
  $("roomNumberPrefix").textContent = lang.roomNumberPrefix;
  $("startGameBtn").textContent = lang.startGameBtn;
  $("playersHeading").textContent = lang.playersHeading;
  $("answerInput").setAttribute("placeholder", lang.answerPlaceholder);
  $("answerBtn").textContent = lang.answerBtn;
  $("showAnswerBtn").textContent = lang.showAnswerBtn;
  $("nextQuestionBtn").textContent = lang.nextQuestionBtn;
};

const initEventListeners = () => {
  $("newRoomBtn").addEventListener("click", () => {
    socket.emit("newRoom");
  });

  $("joinRoomBtn").addEventListener("click", () => {
    const playerName = $("playerNameInput").value;
    currentPlayerName = playerName;
    const roomNumber = $("roomNumberInput").value;
    if (roomNumber) {
      socket.emit("joinRoom", { playerName, roomNumber });
    }
  });

  $("startGameBtn").addEventListener("click", () => {
    socket.emit("startGame", currentRoom);
  });

  $("answerBtn").addEventListener("click", () => {
    const answer = $("answerInput").value;
    socket.emit("sendAnswer", { currentRoom, currentPlayerName, answer });
  });

  $("showAnswerBtn").addEventListener("click", () => {
    socket.emit("showAnswer", currentRoom);
  });

  $("nextQuestionBtn").addEventListener("click", () => {
    socket.emit("nextQuestion", currentRoom);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initTextContent();
  initEventListeners();
});

socket.on("roomCreated", (roomNumber) => {
  $("mainButtons").classList.add("hidden");
  $("roomNumberWrapper").classList.remove("hidden");
  $("startGameSection").classList.remove("hidden");
  $("roomNumberDisplay").textContent = roomNumber;
  currentRoom = roomNumber;
});

socket.on("joinedRoom", (roomNumber) => {
  $("mainButtons").classList.add("hidden");
  $("roomNumberWrapper").classList.remove("hidden");
  $("roomNumberDisplay").textContent = roomNumber;
  currentRoom = roomNumber;
});

socket.on("playerList", (players) => {
  const listDiv = $("playerList");
  listDiv.innerHTML = "";
  players.forEach((name) => {
    const p = document.createElement("p");
    p.textContent = name;
    listDiv.appendChild(p);
  });
  listDiv.classList.remove("hidden");
});

socket.on("gameStarted", (data) => {
  const { question, answer } = data;
  $("questionDisplay").innerHTML = question;
  $("startGameSection").classList.add("hidden");
  $("playerList").classList.add("hidden");
  $("roomNumberWrapper").classList.add("hidden");
  $("gameContainer").classList.remove("hidden");
  $("gameTitle").classList.add("hidden");
  if (currentPlayerName !== "") {
    $("answerInputWrapper").classList.remove("hidden");
  } else {
    $("showAnswerWrapper").classList.remove("hidden");
  }
  $("correctAnswerDisplay").innerHTML = `${answer}%`;
});

socket.on("answered", (data) => {
  const { playerName, answerFromServer } = data;
  if (playerName === currentPlayerName) {
    $("answerInput").value = "";
    $("answerInputWrapper").classList.add("hidden");
  }
  const answersContainer = $("answersContainer");
  answersContainer.classList.remove("hidden");
  const div = document.createElement("div");
  div.classList.add("public-answer");
  div.innerHTML = `${playerName}: ${answerFromServer}`;
  answersContainer.appendChild(div);
});

socket.on("answerShown", (data) => {
  $("correctAnswerDisplay").classList.remove("hidden");
  $("showAnswerBtn").classList.add("hidden");
  $("answersContainer").classList.add("hidden");
  $("scoresDisplay").classList.remove("hidden");
  if (currentPlayerName === "") {
    $("nextQuestionBtn").classList.remove("hidden");
  }
  const { players } = data;
  const scoresDiv = $("scoresDisplay");
  scoresDiv.innerHTML = `<h3>${lang.scoreHeading}</h3>`;
  players.forEach((player) => {
    const div = document.createElement("div");
    div.textContent = `${player.name}: ${player.score}`;
    scoresDiv.appendChild(div);
  });
});

socket.on("showingNextQuestion", (data) => {
  const { question, answer } = data;
  $("questionDisplay").innerHTML = question;
  $("correctAnswerDisplay").innerHTML = `${answer}%`;
  if (currentPlayerName !== "") {
    $("answerInputWrapper").classList.remove("hidden");
  } else {
    $("showAnswerWrapper").classList.remove("hidden");
  }
  $("correctAnswerDisplay").classList.add("hidden");
  $("showAnswerBtn").classList.remove("hidden");
  $("nextQuestionBtn").classList.add("hidden");
  $("scoresDisplay").classList.add("hidden");
  $("answersContainer").innerHTML = "";
});
