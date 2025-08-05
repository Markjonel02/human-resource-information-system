// hooks/useInactivityLogout.js
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const useInactivityLogout = (timeout = 100000) => {
  //5mminutes inactivity time
  const navigate = useNavigate();
  const toast = useToast();
  const timer = useRef();

  const logout = () => {
    localStorage.removeItem("accessToken");
    toast({
      title: "Session expired due to inactivity",
      description: "You have been logged out automatically.",
      status: "info",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
    navigate("/login");
  };

  const resetTimer = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Initialize timer on load

    return () => {
      clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);
};

export default useInactivityLogout;
