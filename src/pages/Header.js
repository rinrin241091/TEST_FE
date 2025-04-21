import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import "../assets/styles/Header.css";

// Component cho phần Input PIN
const PinInput = ({ pinValue, handlePinChange }) => (
  <div className="pin-container">
    <label>Join Game, Enter PIN:</label>
    <input
      type="text"
      placeholder="123456"
      value={pinValue}
      onChange={handlePinChange}
      className="pin-input"
    />
  </div>
);

// Component cho phần Search
const SearchBar = ({ isSearchActive, toggleSearch }) => (
  <>
    <button
      className={`search-btn ${isSearchActive ? "active" : ""}`}
      onClick={toggleSearch}
      aria-label="Search"
    >
      <svg
        className="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
    {isSearchActive && (
      <div className="search-overlay">
        <div className="search-modal">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="search-input"
            autoFocus
          />
          <button
            className="close-search-btn"
            onClick={toggleSearch}
            aria-label="Close search"
          >
            ✕
          </button>
        </div>
      </div>
    )}
  </>
);

function Header() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [user, setUser] = useState(null);

  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Function to update user state from localStorage
  const updateUserState = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // Initial user state setup
  useEffect(() => {
    updateUserState();
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        updateUserState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userStateChange", updateUserState);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userStateChange", updateUserState);
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handlePinChange = (e) => {
    setPinValue(e.target.value);
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    handleSettingsClose();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleSettingsClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.dispatchEvent(new Event("userStateChange"));
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="main-header">
        <div className="logo">NQUIZ.com</div>

        <PinInput pinValue={pinValue} handlePinChange={handlePinChange} />

        <div className="header-buttons">
          <SearchBar
            isSearchActive={isSearchActive}
            toggleSearch={toggleSearch}
          />

          <IconButton
            className="settings-btn"
            aria-label="Settings"
            onClick={handleSettingsClick}
          >
            <SettingsIcon />
          </IconButton>

          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsClose}
          >
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            {user?.role === "admin" && (
              <MenuItem onClick={handleDashboardClick}>Dashboard</MenuItem>
            )}
          </Menu>

          {user ? (
            <button className="sign-in-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="sign-in-btn" onClick={() => navigate("/login")}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
