import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkApiStatus } from './sw-register';

// Register service worker (only in development mode)
registerServiceWorker();

// Check API status
checkApiStatus();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
