import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import HomePage from './pages/HomePage';
import CreateQuiz from './pages/CreateQuiz';
import CreateQuestion from './pages/CreateQuestion';
import GameHost from './components/GameHost';
import GamePlayer from './components/GamePlayer';
import './App.css';

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#2196F3' }}>
          <Toolbar>
            <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
              NQuiz
            </Typography>
            <Button 
              component={Link} 
              to="/create" 
              color="inherit"
              sx={{ mr: 2 }}
            >
              CREATE QUIZ
            </Button>
            <Button 
              component={Link} 
              to="/join-game" 
              color="inherit"
            >
              JOIN GAME
            </Button>
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateQuestion />} />
            <Route path="/join-game" element={<GamePlayer />} />
            <Route path="/game/host/:gamePin" element={<GameHost />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App; 