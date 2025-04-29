import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { questionService } from '../services/api';

const CreateQuestion = ({ onQuestionCreated }) => {
  const [question, setQuestion] = useState({
    title: '',
    content: '',
    type: 'multiple_choice',
    options: ['', ''],
    correctAnswer: '',
    time_limit: 30,
    points: 10
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    setQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: prev.correctAnswer === prev.options[index] ? '' : prev.correctAnswer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setShowAlert(true);

    // Validation
    if (!question.content.trim()) {
      setError('Question content is required');
      setLoading(false);
      return;
    }
    if (!question.correctAnswer) {
      setError('Please select the correct answer');
      setLoading(false);
      return;
    }
    if (question.options.some(opt => !opt.trim())) {
      setError('All options must be filled');
      setLoading(false);
      return;
    }

    try {
      const response = await questionService.createQuestion({
        title: question.title || question.content.substring(0, 50),
        content: question.content,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer
      });
      
      if (response.success) {
        setSuccess('Question created successfully!');
        if (onQuestionCreated) {
          onQuestionCreated(response.data);
        }
        // Reset form
        setQuestion({
          title: '',
          content: '',
          type: 'multiple_choice',
          options: ['', ''],
          correctAnswer: '',
          time_limit: 30,
          points: 10
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Question
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title (Optional)"
              name="title"
              value={question.title}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Question Content"
              name="content"
              value={question.content}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                name="type"
                value={question.type}
                onChange={handleInputChange}
                label="Question Type"
              >
                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Options
            </Typography>
            {question.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                <IconButton
                  color="error"
                  onClick={() => removeOption(index)}
                  disabled={question.options.length <= 2}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addOption}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Option
            </Button>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                name="correctAnswer"
                value={question.correctAnswer}
                onChange={handleInputChange}
                label="Correct Answer"
                required
              >
                {question.options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option || `Option ${index + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={showAlert && (Boolean(error) || Boolean(success))}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreateQuestion; 