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
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Chip,
  LinearProgress
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { questionService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const GameReport = () => {
  const { gamePin } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Get results from socket
    socketService.onGameResults((data) => {
      setResults(data);
      setLoading(false);
    });

    // If no results, get from API
    const fetchResults = async () => {
      try {
        const response = await questionService.getGameResults(gamePin);
        if (response.success) {
          setResults(response.data);
          setIsHost(response.data.isHost || false);
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

  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Results',
        text: `I scored ${results.score} out of ${results.totalQuestions} in the quiz!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Results link copied to clipboard!');
    }
  };

  const handleDownloadResults = () => {
    const data = {
      score: results.score,
      totalQuestions: results.totalQuestions,
      questions: results.questions.map(q => ({
        question: q.text,
        yourAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: q.isCorrect
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${gamePin}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Prepare data for score distribution chart
  const scoreData = results.questions.map((q, index) => ({
    name: `Q${index + 1}`,
    score: q.isCorrect ? 1 : 0
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Score Summary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom align="center">
                Quiz Results
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h2" color="primary">
                  {results.score}/{results.totalQuestions}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {Math.round((results.score / results.totalQuestions) * 100)}% Correct
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(results.score / results.totalQuestions) * 100} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={handleShareResults}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadResults}
                >
                  Download
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Score Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="score" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Questions List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Questions Review
              </Typography>
              <List>
                {results.questions.map((question, index) => (
                  <Paper key={index} sx={{ mb: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle1">
                              Question {index + 1}: {question.text}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`Your answer: ${question.userAnswer}`}
                                color={question.isCorrect ? "success" : "error"}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={`Correct answer: ${question.correctAnswer}`}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Get explanation">
                          <IconButton
                            edge="end"
                            onClick={() => handleExplainQuestion(question)}
                          >
                            <LightbulbIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

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