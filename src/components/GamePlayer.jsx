import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Grid
} from '@mui/material';
import { socketService } from '../services/socket.js';

const GamePlayer = () => {
  const [playerName, setPlayerName] = useState('');
  const [gamePin, setGamePin] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isJoined) {
      const socket = socketService.connect();

      socketService.onGameStarted(() => {
        setError('');
        console.log('Game started!');
      });

      socketService.onQuestionReceived((data) => {
        setCurrentQuestion(data.question);
        setSelectedAnswer('');
        startTimer(data.timeLimit || 30);
      });

      socketService.onGameEnded((data) => {
        setCurrentQuestion(null);
        console.log('Game ended:', data);
      });

      socketService.onError(({ message }) => {
        setError(message);
        setLoading(false);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isJoined]);

  const startTimer = (duration) => {
    setTimeLeft(duration);
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitAnswer();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!gamePin.trim() || !playerName.trim()) {
      setError('Please enter both game PIN and your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      socketService.connect();
      socketService.joinGame(gamePin, playerName);
      
      socketService.onGameJoined(() => {
        setIsJoined(true);
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to join game');
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const timeSpent = 30 - timeLeft; // Assuming 30 seconds total
    socketService.submitAnswer(gamePin, playerName, selectedAnswer, timeSpent);
    setSelectedAnswer('');
  };

  if (!isJoined) {
    return (
      <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Paper component="form" onSubmit={handleJoinGame} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Join Game
          </Typography>
          
          <TextField
            fullWidth
            label="Game PIN"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            margin="normal"
            required
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Join Game'}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        {currentQuestion ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {currentQuestion.content}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Choose your answer:</FormLabel>
                <RadioGroup
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Time left: {timeLeft}s
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Waiting for the game to start...
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GamePlayer; 