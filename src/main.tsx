import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MessagesProvider } from "./MessagesProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessagesProvider>
      <App />
    </MessagesProvider>
  </StrictMode>
);
