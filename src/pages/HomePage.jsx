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
  MenuItem
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import socketService from '../services/socket';

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
    navigate('/create-question');
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
      navigate('/join', { state: { gamePin, playerName } });
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

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Create Quiz Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isAuthenticated ? 'primary.light' : 'grey.300',
                color: 'white'
              }}
            >
              <Typography variant="h4" gutterBottom>
                Create a Quiz
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                {isAuthenticated 
                  ? 'Create your own quiz and host a game for others to join!'
                  : 'Login to create and host your own quizzes'}
              </Typography>
              <Button
                variant="contained"
                color={isAuthenticated ? "secondary" : "primary"}
                size="large"
                onClick={handleCreateQuiz}
              >
                {isAuthenticated ? 'Create Quiz' : 'Login to Create'}
              </Button>
            </Paper>
          </Grid>

          {/* Join Game Section */}
          <Grid item xs={12} md={6}>
            <Paper
              component="form"
              onSubmit={handleJoinGame}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h4" gutterBottom>
                Join a Game
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
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
              >
                Join Game
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 