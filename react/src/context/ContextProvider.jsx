import axiosClient from "../axios-client.js";
import React, { createContext, useContext, useState, useEffect } from "react";

const AUTO_LOGOUT_DURATION =
  import.meta.env.VITE_AUTO_LOGOUT_DURATION || 3600000;
const RELOAD_GRACE_PERIOD = 300000; // 5 minutes in milliseconds

const StateContext = createContext({
  currentUser: null,
  token: null,
  notification: null,
  setUser: () => {},
  setToken: () => {},
  setNotification: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [notification, _setNotification] = useState("");
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setNotification = (message) => {
    _setNotification(message);

    setTimeout(() => {
      _setNotification("");
    }, 5500);
  };

  useEffect(() => {
    let timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isLoggedOut) {
          setIsLoggedOut(true);
          axiosClient.post("/logout").then(() => {
            setToken(null);
            window.location.href = "/login";
          });
        }
      }, AUTO_LOGOUT_DURATION);
    };

    const checkSession = () => {
      if (sessionStorage.getItem("lastActivity")) {
        const lastActivity = Number(sessionStorage.getItem("lastActivity"));
        const now = Date.now();
        if (now - lastActivity > AUTO_LOGOUT_DURATION) {
          if (!isLoggedOut) {
            setIsLoggedOut(true);
            axiosClient.post("/logout").then(() => {
              setToken(null);
              window.location.href = "/login";
            });
          }
        }
      }
      sessionStorage.setItem("lastActivity", Date.now());
      resetTimeout();
    };

    const handlePageHide = () => {
      // Save the time when the page is hidden
      sessionStorage.setItem("lastPageHideTime", Date.now());
    };

    const handlePageShow = () => {
      // Compare the time when the page is shown again with the last hide time
      const lastPageHideTime = Number(
        sessionStorage.getItem("lastPageHideTime")
      );
      if (Date.now() - lastPageHideTime > RELOAD_GRACE_PERIOD) {
        // If the page was hidden for more than the grace period, log out the user
        localStorage.removeItem("ACCESS_TOKEN");
        setToken(null);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("mousemove", checkSession);
    window.addEventListener("keydown", checkSession);

    checkSession();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("mousemove", checkSession);
      window.removeEventListener("keydown", checkSession);
    };
  }, [setToken, isLoggedOut]);

  return (
    <StateContext.Provider
      value={{ user, setUser, token, setToken, notification, setNotification }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
