import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { questionService } from '../services/api';

const GameReport = () => {
  const { gamePin } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);

  useEffect(() => {
    // Lấy kết quả từ socket
    socketService.onGameResults((data) => {
      setResults(data);
      setLoading(false);
    });

    // Nếu không có kết quả, lấy từ API
    const fetchResults = async () => {
      try {
        const response = await questionService.getGameResults(gamePin);
        if (response.success) {
          setResults(response.data);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    return () => {
      socketService.removeAllListeners();
    };
  }, [gamePin]);

  const handleExplainQuestion = async (question) => {
    setSelectedQuestion(question);
    setExplanationLoading(true);
    try {
      const response = await questionService.getExplanation(question.id);
      if (response.success) {
        setExplanation(response.data.explanation);
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Could not get explanation at this time.');
    } finally {
      setExplanationLoading(false);
    }
  };

  const handleCloseExplanation = () => {
    setSelectedQuestion(null);
    setExplanation('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!results) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          No results found for this game.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Quiz Results
          </Typography>
          <Typography variant="h6" gutterBottom align="center">
            Score: {results.score} / {results.totalQuestions}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            {results.score === results.totalQuestions 
              ? 'Perfect score! Well done!'
              : `You answered ${results.score} out of ${results.totalQuestions} questions correctly.`}
          </Typography>
        </Paper>

        <List>
          {results.questions.map((question, index) => (
            <Paper key={index} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={`Question ${index + 1}: ${question.text}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Your answer: {question.userAnswer}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.primary">
                        Correct answer: {question.correctAnswer}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {question.isCorrect ? (
                    <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  ) : (
                    <CancelIcon color="error" sx={{ mr: 2 }} />
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => handleExplainQuestion(question)}
                    title="Get explanation"
                  >
                    <LightbulbIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      {/* Explanation Dialog */}
      <Dialog
        open={!!selectedQuestion}
        onClose={handleCloseExplanation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Explanation for Question
        </DialogTitle>
        <DialogContent>
          {explanationLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Typography>
              {explanation || 'No explanation available.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExplanation}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GameReport; 