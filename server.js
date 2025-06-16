import { WebSocketServer } from "ws";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { createServer } from "http";
config();

const app = express();
app.use(express.static("dist"));

const server = createServer(app);

const wss = new WebSocketServer({ server });

/** @type {Map<string, Room>} */
const rooms = new Map();

function createRoom(roomId) {
  const room = { id: roomId, clients: new Set(), url: null };
  rooms.set(roomId, room);
  return room;
}

function sendMessageToClients(room, message) {
  room.clients.forEach((client) => {
    client.ws.send(JSON.stringify(message));
  });
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
  ws.on("open", () => {
    console.log("WebSocket connection opened");
  });

  ws.on("message", (message) => {
    try {
      /** @type {Message} */
      const msg = JSON.parse(message.toString());
      console.log("Received message:", msg);
      switch (msg.type) {
        case "create": {
          const roomId = uuidv4();
          const room = createRoom(roomId);
          /** @type {Client} */
          const client = { id: uuidv4(), ws, role: "host" };
          room.clients.add(client);
          ws.send(JSON.stringify({ type: "created", roomId }));
          break;
        }
        case "join": {
          const { roomId } = msg;
          if (!rooms.has(roomId)) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          const room = rooms.get(roomId);
          /** @type {Client} */
          const client = { id: uuidv4(), ws, role: "guest" };
          room.clients.add(client);
          sendMessageToClients(room, {
            type: "joined",
            roomId: room.id,
            clientId: client.id,
          });
          break;
        }
        case "setVideoUrl": {
          const { roomId, url } = msg;
          if (!rooms.has(roomId)) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          const room = rooms.get(roomId);
          room.url = url;
          sendMessageToClients(room, {
            type: "setVideoUrl",
            roomId: room.id,
            url,
          });

          break;
        }
        case "message": {
          const { roomId, message, userId } = msg;
          if (!rooms.has(roomId)) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          const room = rooms.get(roomId);
          const timestamp = Date.now();
          sendMessageToClients(room, {
            type: "messageReceived",
            message,
            userId,
            timestamp,
          });
          break;
        }
        case "play":
        case "pause": {
          const { roomId, currentTime, userId } = msg;
          if (!rooms.has(roomId)) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          const room = rooms.get(roomId);
          sendMessageToClients(room, {
            type: "videoSync",
            action: msg.type,
            currentTime,
            userId,
          });
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });
});

const port = process.env.VITE_PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`WebSocket server is also running on ws://localhost:${port}`);
});
