import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server started on ws://localhost:8080");

interface Client {
  ws: WebSocket;
  id: string;
  roomId?: string;
}

interface Room {
  id: string;
  clients: Set<Client>;
}

const rooms = new Map<string, Room>();

type MessageType = "join" | "leave" | "message" | "joined" | "left" | "create";

type Message = {
  type: MessageType;
  [key: string]: any;
};

function createRoom(roomId: string): Room {
  const room: Room = { id: roomId, clients: new Set() };
  rooms.set(roomId, room);
  return room;
}

function joinRoom(client: Client, roomId: string): void {
  let room = rooms.get(roomId);
  if (!room) {
    throw new Error(`Room ${roomId} does not exist`);
  }
  room.clients.add(client);
  client.roomId = roomId;
}

function leaveRoom(client: Client): void {
  if (!client.roomId) {
    throw new Error("Client is not in a room");
  }
  const room = rooms.get(client.roomId!);
  if (room) {
    room.clients.delete(client);
    if (room.clients.size === 0) {
      rooms.delete(client.roomId!);
    }
  }
}

function sendMessageToRoom(room: Room, message: Message): void {
  room.clients.forEach((client) => {
    client.ws.send(JSON.stringify(message));
  });
}

wss.on("connection", (ws) => {
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message.toString()) as Message;
      switch (msg.type) {
        case "create": {
          const room = createRoom(msg.roomId);
          const client: Client = { ws, id: msg.id, roomId: room.id };
          room.clients.add(client);
          sendMessageToRoom(room, {
            type: "joined",
            message: "User joined room",
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
