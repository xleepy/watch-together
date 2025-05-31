import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { config } from "dotenv";
config();

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.static("dist"));

/** @type {Map<string, Room>} */
const rooms = new Map();

function createRoom(roomId) {
  const room = { id: roomId, clients: new Set() };
  rooms.set(roomId, room);
  return room;
}

function joinRoom(client, roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    throw new Error(`Room ${roomId} does not exist`);
  }
  room.clients.add(client);
  client.roomId = roomId;
}

function leaveRoom(client) {
  if (!client.roomId) {
    throw new Error("Client is not in a room");
  }
  const room = rooms.get(client.roomId);
  if (room) {
    room.clients.delete(client);
    if (room.clients.size === 0) {
      rooms.delete(client.roomId);
    }
  }
}

/**
 *
 * @param {Room} room
 * @param {Message} message
 */
function sendMessageToRoom(room, message) {
  room.clients.forEach((client) => {
    client.ws.send(JSON.stringify(message));
  });
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("message", (message) => {
    try {
      /** @type {Message} */
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case "create": {
          const room = createRoom(msg.roomId);
          const client = { ws, id: msg.id, roomId: room.id };
          room.clients.add(client);
          sendMessageToRoom(room, {
            type: "created",
            roomId: room.id,
          });
          break;
        }
        case "setVideoUrl": {
          const roomToSet = rooms.get(msg.roomId);
          if (!roomToSet) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room not found" })
            );
            return;
          }
          sendMessageToRoom(roomToSet, {
            type: "setVideoUrl",
            videoUrl: msg.videoUrl,
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
