const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const questions = [
  {
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correct: "Paris"
  },
  {
    text: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Mercury"],
    correct: "Mars"
  }
];

let gameState = {
  scores: {},
  currentQuestion: null,
  questionIndex: -1
};

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('gameState', gameState);

  socket.on('join', (name) => {
    if (!gameState.scores[name]) {
      gameState.scores[name] = 0;
      io.emit('gameState', gameState);
    }
  });

  socket.on('answer', ({ name, answer }) => {
    if (gameState.currentQuestion && answer === gameState.currentQuestion.correct) {
      gameState.scores[name] = (gameState.scores[name] || 0) + 10;
      io.emit('gameState', gameState);
    }
  });

  socket.on('nextQuestion', () => {
    gameState.questionIndex = (gameState.questionIndex + 1) % questions.length;
    gameState.currentQuestion = questions[gameState.questionIndex];
    io.emit('gameState', gameState);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});