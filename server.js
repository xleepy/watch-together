import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
config();

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

/** @type {Map<string, Room>} */
const rooms = new Map();

function createRoom(roomId) {
  const room = { id: roomId, clients: new Set(), url: null };
  rooms.set(roomId, room);
  return room;
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
        case "register": {
          const { roomId } = msg;
          if (!rooms.has(roomId)) {
            createRoom(roomId);
          }
          const room = rooms.get(roomId);
          room.clients.add(ws);
          ws.send(
            JSON.stringify({
              type: "registered",
              roomId: room.id,
              url: room.url,
            })
          );
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
          room.clients.forEach((client) => {
            client.send(
              JSON.stringify({ type: "setVideoUrl", url, roomId: room.id })
            );
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

app.post("/api/rooms/create", (req, res) => {
  const newRoomId = uuidv4();
  const room = createRoom(newRoomId);
  res.json({ roomId: room.id });
});

app.post("/api/rooms/join", (req, res) => {
  const { roomId } = req.body;

  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.send(200);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`WebSocket server is also running on ws://localhost:${port}`);
});
