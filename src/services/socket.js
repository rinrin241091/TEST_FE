import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
      });

      // Setup default event listeners
      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
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

  // Game host methods
  createGame(quiz) {
    if (!this.socket) return;
    this.socket.emit('create-game', quiz);
  }

  startGame(gamePin) {
    if (!this.socket) return;
    this.socket.emit('start-game', gamePin);
  }

  nextQuestion(gamePin) {
    if (!this.socket) return;
    this.socket.emit('next-question', gamePin);
  }

  // Player methods
  joinGame(gamePin, playerName) {
    if (!this.socket) return;
    this.socket.emit('join-game', { gamePin, playerName });
  }

  submitAnswer(gamePin, questionId, answer, timeSpent) {
    if (!this.socket) return;
    this.socket.emit('submit-answer', { gamePin, questionId, answer, timeSpent });
  }

  // Event listeners
  onGameCreated(callback) {
    this.addListener('game-created', callback);
  }

  onGameJoined(callback) {
    this.addListener('game-joined', callback);
  }

  onGameStarted(callback) {
    this.addListener('game-started', callback);
  }

  onQuestionReceived(callback) {
    this.addListener('question', callback);
  }

  onAnswerSubmitted(callback) {
    this.addListener('answer-submitted', callback);
  }

  onGameFinished(callback) {
    this.addListener('game-finished', callback);
  }

  onPlayerJoined(callback) {
    this.addListener('player-joined', callback);
  }

  onPlayerLeft(callback) {
    this.addListener('player-left', callback);
  }

  onError(callback) {
    this.addListener('error', callback);
  }

  // Helper methods
  addListener(event, callback) {
    if (!this.socket) return;
    
    const listener = (...args) => callback(...args);
    this.socket.on(event, listener);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
  }

  removeListener(event, callback) {
    if (!this.socket || !this.listeners.has(event)) return;
    
    const listeners = this.listeners.get(event);
    for (const listener of listeners) {
      if (listener === callback) {
        this.socket.off(event, listener);
        listeners.delete(listener);
        break;
      }
    }
  }

  removeAllListeners() {
    if (!this.socket) return;
    
    for (const [event, listeners] of this.listeners) {
      for (const listener of listeners) {
        this.socket.off(event, listener);
      }
    }
    this.listeners.clear();
  }
}

export const socketService = new SocketService(); 