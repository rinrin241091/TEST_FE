import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GameResults = ({ results }) => {
  const navigate = useNavigate();

  const sortedPlayers = [...(results?.players || [])].sort((a, b) => b.score - a.score);

  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Game Results
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Correct Answers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow
                  key={player.id}
                  sx={index === 0 ? { backgroundColor: 'rgba(255, 215, 0, 0.1)' } : {}}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell align="right">{player.score}</TableCell>
                  <TableCell align="right">{player.correctAnswers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayAgain}
            size="large"
          >
            Play Again
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GameResults; 