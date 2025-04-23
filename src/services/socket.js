import { io } from 'socket.io-client';
import { API_ENDPOINTS } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(API_ENDPOINTS.SOCKET, {
        transports: ['websocket'],
        autoConnect: true
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game creation
  createGame(questions) {
    if (!this.socket) return;
    this.socket.emit('create-game', { questions });
  }

  // Game joining
  joinGame(gamePin, playerName) {
    if (!this.socket) return;
    this.socket.emit('join-game', { gamePin, playerName });
  }

  // Game starting
  startGame(gamePin) {
    if (!this.socket) return;
    this.socket.emit('start-game', { gamePin });
  }

  // Answer submission
  submitAnswer(gamePin, playerId, answer, timeSpent) {
    if (!this.socket) return;
    this.socket.emit('submit-answer', { gamePin, playerId, answer, timeSpent });
  }

  // Next question
  nextQuestion(gamePin) {
    if (!this.socket) return;
    this.socket.emit('next-question', { gamePin });
  }

  // Event listeners
  onGameCreated(callback) {
    if (!this.socket) return;
    this.socket.on('game-created', callback);
  }

  onGameJoined(callback) {
    if (!this.socket) return;
    this.socket.on('game-joined', callback);
  }

  onPlayerJoined(callback) {
    if (!this.socket) return;
    this.socket.on('player-joined', callback);
  }

  onGameStarted(callback) {
    if (!this.socket) return;
    this.socket.on('game-started', callback);
  }

  onQuestionReceived(callback) {
    if (!this.socket) return;
    this.socket.on('question', callback);
  }

  onAnswerSubmitted(callback) {
    if (!this.socket) return;
    this.socket.on('answer-submitted', callback);
  }

  onGameEnded(callback) {
    if (!this.socket) return;
    this.socket.on('game-ended', callback);
  }

  onError(callback) {
    if (!this.socket) return;
    this.socket.on('error', callback);
  }

  // Remove listeners
  removeListener(event) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }
}

export default new SocketService(); 