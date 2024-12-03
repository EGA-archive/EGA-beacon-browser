import React, { useState, useEffect } from "react";
import { useAuth } from "oidc-react";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";

const LoggedIn = ({ onClickHandler }) => {
  const [isActive, setIsActive] = useState(false);
  const [logoutIsActive, setLogoutIsActive] = useState(false);
  const auth = useAuth();

  const handleLoginClick = () => {
    onClickHandler();
    setIsActive(true);
    console.log("Login handleLoginClick:", isActive);
    console.log("Logout handleLoginClick:", logoutIsActive);
  };

  // const handleLogoutClick = () => {
  //   auth.signOut();
  //   setLogoutIsActive(false); // Reset logout button state
  //   console.log("Login handleLogoutClick:", isActive)
  //   console.log("Logout handleLogoutClick:", logoutIsActive)
  // };

  const handleLogoutClick = () => {
    setLogoutIsActive(true);
  };
  useEffect(() => {
    if (logoutIsActive) {
      setTimeout(() => auth.signOut(), 600);
      //      alert('You are logged out!')
      // window.location.hash = ''
    }
  }, [logoutIsActive]);

  if (auth && auth.userData) {
    return (
      <button
        className={`logout-button ${
          logoutIsActive ? "logout-button-active" : ""
        }`} // Apply active class if isActive is true
        onClick={handleLogoutClick}
      >
        <ExitToAppRoundedIcon
          className={`user-icon ${logoutIsActive ? "user-icon-active" : ""}`} // Conditional class for active state
        />
        Log Out
      </button>
    );
  } else {
    // User is logged out, show the Log In button
    return (
      <button
        className={`login-button ${isActive ? "login-button-active" : ""}`} // Apply active class if isActive is true
        onClick={handleLoginClick}
      >
        <img
          src={isActive ? "/../userimageblue.svg" : "/../userimage.png"} // Use red image if active
          className="user-icon"
          alt="User Icon"
        />
        Log In
      </button>
    );
  }
};

export default LoggedIn;
