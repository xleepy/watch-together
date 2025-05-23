"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    const client = new WebSocket("ws://localhost:8080");
    client.onopen = () => {
      console.log("WebSocket connection opened");
      client.send("Hello, server!");
    };
    client.onmessage = (event) => {
      setMessage(JSON.stringify(event.data));
      console.log("Message from server:", event.data);
    };
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    return () => {
      client.close();
      console.log("WebSocket connection closed");
    };
  }, []);
  return <div className="grid">{message}</div>;
}
