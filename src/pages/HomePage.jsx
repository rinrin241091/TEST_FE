import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { socketService } from '../services/socket';

const HomePage = () => {
  const navigate = useNavigate();
  const [gamePin, setGamePin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCreateQuiz = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/create-quiz');
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!gamePin.trim() || !playerName.trim()) {
      setError('Please enter both game PIN and your name');
      return;
    }

    // Connect to socket
    const socket = socketService.connect();

    // Join game
    socketService.joinGame(gamePin, playerName);

    // Listen for join response
    socketService.onGameJoined(() => {
      navigate(`/game/join/${gamePin}`, { state: { playerName } });
    });

    // Listen for errors
    socketService.onError(({ message }) => {
      setError(message);
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    handleMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        {isAuthenticated && user ? (
          <>
            <IconButton onClick={handleMenuOpen}>
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Welcome to NQuiz
        </Typography>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {/* Create Quiz Section */}
          <Box sx={{ 
            p: 4, 
            bgcolor: '#1a2634', 
            borderRadius: 2,
            width: '400px',
            textAlign: 'left'
          }}>
            <Typography variant="h5" gutterBottom color="white">
              Create a quiz
            </Typography>
            <Typography variant="body1" color="gray" sx={{ mb: 3 }}>
              {isAuthenticated 
                ? 'Play for free with 500 participants'
                : 'Login required to create quiz'}
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateQuiz}
              sx={{ 
                bgcolor: isAuthenticated ? 'white' : 'rgba(255,255,255,0.3)', 
                color: '#1a2634',
                '&:hover': {
                  bgcolor: isAuthenticated ? '#f5f5f5' : 'rgba(255,255,255,0.4)'
                }
              }}
            >
              {isAuthenticated ? 'Create custom' : 'Login to create'}
            </Button>
          </Box>

          {/* Join Game Section */}
          <Box sx={{ 
            p: 4, 
            bgcolor: '#1a2634', 
            borderRadius: 2,
            width: '400px',
            textAlign: 'left'
          }}>
            <Typography variant="h5" gutterBottom color="white">
              Join Game
            </Typography>
            <Box component="form" onSubmit={handleJoinGame}>
              <TextField
                fullWidth
                placeholder="Game PIN"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value)}
                sx={{ 
                  mb: 2,
                  bgcolor: 'white',
                  borderRadius: 1
                }}
              />
              <TextField
                fullWidth
                placeholder="Your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                sx={{ 
                  mb: 2,
                  bgcolor: 'white',
                  borderRadius: 1
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ 
                  bgcolor: '#4CAF50',
                  '&:hover': {
                    bgcolor: '#45a049'
                  }
                }}
              >
                Join
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage; 