const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Quiz endpoints
  CREATE_QUESTION: `${API_BASE_URL}/api/questions`,
  CREATE_QUIZ: `${API_BASE_URL}/api/quizzes`,
  GET_QUIZZES: `${API_BASE_URL}/api/quizzes`,
  GET_QUIZ_BY_ID: (id) => `${API_BASE_URL}/api/quizzes/${id}`,
  
  // Game endpoints
  CREATE_GAME: `${API_BASE_URL}/api/games`,
  JOIN_GAME: `${API_BASE_URL}/api/games/join`,
  
  // Socket URL
  SOCKET: SOCKET_URL,
};

export default API_ENDPOINTS; 