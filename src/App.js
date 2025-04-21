// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
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

function App() {
  return (
    <div className="app">
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
      </Routes>
    </div>
  );
}

export default App;
