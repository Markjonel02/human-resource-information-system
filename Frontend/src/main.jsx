import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { setToast } from "./lib/toastService.jsx";

/* import SessionPing from "./lib/SessionPing.jsx"; */
const ToastManager = () => {
  const toast = useToast();

  useEffect(() => {
    setToast(toast);
  }, [toast]);

  return null; // no UI, just injects toast globally
};
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <ToastManager />
        {/* <SessionPing /> */}
        {/* AuthProvider wraps the entire app to provide authentication context */}
        <App />
      </ChakraProvider>{" "}
    </BrowserRouter>
  </StrictMode>
);
