import { WebSocketServer } from "ws";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
config();

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".mp4";
    const safeExtension = extension.replace(/[^.\w-]/g, "");
    const uniqueName = `${Date.now()}-${uuidv4()}${safeExtension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are supported"));
    }
  },
});

app.use("/uploads", express.static(uploadsDir));

const server = createServer(app);

const wss = new WebSocketServer({ server });

/** @type {Map<string, Room>} */
const rooms = new Map();

async function removeUploadedFile(fileName) {
  if (!fileName) {
    return;
  }
  const filePath = path.join(uploadsDir, fileName);
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete uploaded file ${filePath}:`, error);
    }
  }
}

function createRoom(roomId) {
  const room = {
    id: roomId,
    clients: new Set(),
    url: null,
    uploadedFile: null,
  };
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

app.post("/rooms/:roomId/upload", (req, res) => {
  const { roomId } = req.params;
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }

  upload.single("video")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const room = rooms.get(roomId);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    if (room.uploadedFile && room.uploadedFile !== req.file.filename) {
      await removeUploadedFile(room.uploadedFile);
    }

    room.uploadedFile = req.file.filename;
    room.url = fileUrl;

    sendMessageToClients(room, {
      type: "setVideoUrl",
      roomId: room.id,
      url: fileUrl,
      origin: "upload",
    });

    return res.status(201).json({ roomId: room.id, url: fileUrl });
  });
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  ws.on("close", () => {
    rooms.forEach((room) => {
      if (room.clients.has(ws)) {
        room.clients.delete(ws);
        if (room.clients.size === 0) {
          void removeUploadedFile(room.uploadedFile);
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
          const { roomId, url, origin } = msg;
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
            origin: origin ?? "manual",
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
