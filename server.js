import { WebSocketServer } from "ws";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { createServer } from "http";
import cors from "cors";
config();

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

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
    client.send(JSON.stringify(message));
  });
}

app.post("/create-room", (req, res) => {
  const roomId = uuidv4();
  createRoom(roomId);
  return res.json({ roomId });
});

app.post("/join-room", (req, res) => {
  const { roomId } = req.body;
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }

  const room = rooms.get(roomId);
  /** @type {Client} */
  return res.json({ roomId, url: room.url });
});

app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }
  const room = rooms.get(roomId);
  return res.json({ roomId: room.id, url: room.url });
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  ws.on("close", () => {
    rooms.forEach((room) => {
      if (room.clients.has(ws)) {
        room.clients.delete(ws);
        if (room.clients.size === 0) {
          rooms.delete(room.id);
          console.log(`Room ${room.id} deleted due to no clients`);
        }
      }
    });
  });

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
        case "connected": {
          const { roomId } = msg;
          const room = rooms.get(roomId);
          if (!room) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          room.clients.add(ws);
          /** @type {Client} */
          ws.send(JSON.stringify({ type: "connected", roomId }));
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

// Use environment variable for port, fallback to 3000
const port = process.env.PORT || process.env.VITE_PORT || 3000;
const host = process.env.VITE_HOST || "127.0.0.1";

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`WebSocket server is also running on ws://${host}:${port}`);
});
