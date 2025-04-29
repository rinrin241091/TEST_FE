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
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreateQuestion from '../components/CreateQuestion';
import { questionService } from '../services/api';
import { socketService } from '../services/socket';

const steps = ['Create Questions', 'Create Room'];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gamePin, setGamePin] = useState(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleQuestionCreated = (question) => {
    setQuestions(prev => [...prev, question]);
  };

  const handleCreateQuiz = async () => {
    if (questions.length === 0) {
      setError('Please create at least one question');
      return;
    }

    setLoading(true);
    try {
      // 1. Create quiz in database
      const response = await questionService.createQuiz({
        title: quizTitle || `Quiz ${new Date().toLocaleDateString()}`,
        questions: questions
      });

      if (response.success) {
        // 2. Create game room with socket
        socketService.connect();
        socketService.createGame(response.data.quiz);

        // 3. Listen for game creation response
        socketService.onGameCreated(({ gamePin }) => {
          setGamePin(gamePin);
          setShowPinDialog(true);
          setActiveStep(1);
        });

        // Handle errors
        socketService.onError(({ message }) => {
          setError(message);
          setLoading(false);
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to create quiz');
      setLoading(false);
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(gamePin);
  };

  const handleStartGame = () => {
    navigate(`/game/host/${gamePin}`);
  };

  const handleCloseDialog = () => {
    setShowPinDialog(false);
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
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quiz Title
              </Typography>
              <TextField
                fullWidth
                label="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </Paper>

            <CreateQuestion onQuestionCreated={handleQuestionCreated} />
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Questions Created: {questions.length}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateQuiz}
                disabled={questions.length === 0 || loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Creating...' : 'Create Quiz & Room'}
              </Button>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Room Created Successfully!
            </Typography>
            <Typography variant="h3" color="primary" sx={{ my: 3 }}>
              PIN: {gamePin}
              <IconButton onClick={handleCopyPin} color="primary">
                <ContentCopyIcon />
              </IconButton>
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

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onClose={handleCloseDialog}>
        <DialogTitle>Room Created!</DialogTitle>
        <DialogContent>
          <Typography variant="h4" color="primary" sx={{ my: 2 }}>
            PIN: {gamePin}
            <IconButton onClick={handleCopyPin} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Typography>
          <Typography>
            Share this PIN with your players to let them join the game.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button onClick={handleStartGame} variant="contained" color="primary">
            Start Game
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateQuiz; 