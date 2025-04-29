// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import SportsPage from "./pages/SportsPage";
import EntertainmentPage from "./pages/EntertainmentPage";
import HistoryPage from "./pages/HistoryPage";
import LanguagesPage from "./pages/LanguagesPage";
import ScienceNaturePage from "./pages/ScienceNaturePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import { RequireAuth, RequireAdmin } from "./middleware/authMiddleware";
import Profile from "./pages/Profile";
import CreateQuiz from './pages/CreateQuiz';
import CreateQuestion from './components/CreateQuestion';
import GameHost from './components/GameHost';
import GamePlayer from './components/GamePlayer';
import GameResults from './components/GameResults';
import GameReport from './components/GameReport';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/entertainment" element={<EntertainmentPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/languages" element={<LanguagesPage />} />
        <Route path="/sciencenature" element={<ScienceNaturePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Quiz Routes */}
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/create-question" element={<CreateQuestion />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <UserManagement />
            </RequireAdmin>
          }
        />

        {/* Game Routes */}
        <Route path="/game/host/:gamePin" element={<GameHost />} />
        <Route path="/game/join/:gamePin" element={<GamePlayer />} />
        <Route path="/game/results/:gamePin" element={<GameResults />} />
        <Route path="/game/report/:gamePin" element={<GameReport />} />
      </Routes>
    </div>
  );
}

export default App;
