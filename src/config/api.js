const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Questions
  CREATE_QUESTION: '/questions/create',
  GET_QUESTIONS: '/question',
  
  // Quizzes
  CREATE_QUIZ: '/quizzes/create',
  GET_QUIZZES: '/quizzes',
  GET_QUIZ_BY_ID: (id) => `/quizzes/${id}`,
  
  // Game
  CREATE_GAME: '/games/create',
  JOIN_GAME: '/games/join',
  GET_GAME_RESULTS: '/games/:gamePin/results',
  GET_QUESTION_EXPLANATION: '/questions/:questionId/explanation',
  
  // Socket URL
  SOCKET: SOCKET_URL,
};

export default API_ENDPOINTS; 