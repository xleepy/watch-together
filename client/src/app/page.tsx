"use client";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

const userId = uuid();

export default function Home() {
  const [client, setClient] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  useEffect(() => {
    const client = new WebSocket("ws://localhost:8080");
    client.onopen = () => {
      console.log("WebSocket connection opened");
    };
    client.onmessage = (event) => {
      setMessage(JSON.stringify(event.data));
    };
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    setClient(client);
    return () => {
      client.close();
      console.log("WebSocket connection closed");
    };
  }, []);

  if (!client) {
    return <div>Connecting to socket</div>;
  }

  const createRoom = () => {
    client.send(JSON.stringify({ type: "create", roomId: userId }));
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{`Your room id: ${userId}`}</p>
      <p>{message}</p>
      <button onClick={createRoom}>Create room</button>
    </div>
  );
}
