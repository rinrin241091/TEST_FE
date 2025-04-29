import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Grid
} from '@mui/material';
import { socketService } from '../services/socket.js';

const GameHost = () => {
  const [gamePin, setGamePin] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();

    // Listen for player joining
    socketService.onPlayerJoined((data) => {
      setPlayers(prev => [...prev, data.player]);
    });

    // Listen for answer submissions
    socketService.onAnswerSubmitted((data) => {
      setAnswers(prev => ({
        ...prev,
        [data.playerId]: data.answer
      }));
    });

    // Listen for game end
    socketService.onGameEnded((data) => {
      // Handle game end
      console.log('Game ended:', data);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleStartGame = () => {
    if (players.length === 0) {
      alert('Wait for players to join!');
      return;
    }

    setLoading(true);
    socketService.startGame(gamePin);
    setIsGameStarted(true);
    setLoading(false);
  };

  const handleNextQuestion = () => {
    setLoading(true);
    socketService.nextQuestion(gamePin);
    setAnswers({});
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Game PIN: {gamePin}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartGame}
              disabled={isGameStarted || loading}
              sx={{ mr: 2 }}
            >
              Start Game
            </Button>
            {isGameStarted && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNextQuestion}
                disabled={loading}
              >
                Next Question
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Players ({players.length})
            </Typography>
            <List>
              {players.map((player, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={player.name}
                    secondary={`Score: ${player.score || 0}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Question
            </Typography>
            {currentQuestion ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  {currentQuestion.content}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Answers submitted: {Object.keys(answers).length}/{players.length}
                </Typography>
              </Box>
            ) : (
              <Typography color="textSecondary">
                {isGameStarted ? 'Loading question...' : 'Game not started'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default GameHost; 