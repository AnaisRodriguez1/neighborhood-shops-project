import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { connectToServer } from "./api/websocket"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Wait for the React app to mount before connecting to WebSocket
setTimeout(() => {
  connectToServer();
}, 100);