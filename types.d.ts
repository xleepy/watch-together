type MessageType =
  | "created"
  | "create"
  | "join"
  | "joined"
  | "play"
  | "pause"
  | "message"
  | "setVideoUrl";

interface Client {
  id: string;
  ws: WebSocket;
  roomId: string;
  role: "host" | "guest";
}

interface Room {
  id: string;
  videoUrl: string;
}

type GenericMessage = {
  [key: string]: unknown;
  type: MessageType;
};

type ConnectToRoomMessage = {
  type: "created" | "joined";
  roomId: string;
  url?: string;
};

type SetVideoUrlMessage = {
  type: "setVideoUrl";
  videoUrl: string;
};

type Message = ConnectToRoomMessage | SetVideoUrlMessage | GenericMessage;
