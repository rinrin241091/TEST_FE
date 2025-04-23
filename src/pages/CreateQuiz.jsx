import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import CreateQuestion from '../components/CreateQuestion';
import socketService from '../services/socket';

const steps = ['Create Questions', 'Create Room'];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [gamePin, setGamePin] = useState(null);

  const handleQuestionCreated = (question) => {
    setQuestions(prev => [...prev, question]);
  };

  const handleCreateRoom = async () => {
    if (questions.length === 0) {
      alert('Please create at least one question');
      return;
    }

    // Connect to socket
    const socket = socketService.connect();

    // Create game room
    socketService.createGame(questions);

    // Listen for game creation response
    socketService.onGameCreated(({ gamePin, gameId }) => {
      setGamePin(gamePin);
      setActiveStep(1);
    });

    // Listen for errors
    socketService.onError(({ message }) => {
      alert(message);
    });
  };

  const handleStartGame = () => {
    navigate(`/game/host/${gamePin}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Quiz
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 ? (
          <>
            <CreateQuestion onQuestionCreated={handleQuestionCreated} />
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Questions Created: {questions.length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateRoom}
                disabled={questions.length === 0}
                sx={{ mt: 2 }}
              >
                Create Room
              </Button>
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Room Created!
            </Typography>
            <Typography variant="h3" color="primary" sx={{ my: 3 }}>
              PIN: {gamePin}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Share this PIN with your players to let them join the game.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartGame}
            >
              Start Game
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default CreateQuiz; 