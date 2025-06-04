type MessageType =
  | "created"
  | "create"
  | "join"
  | "joined"
  | "play"
  | "pause"
  | "message"
  | "messageReceived"
  | "setVideoUrl"
  | "videoSync";

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
  url: string;
};

type ChatMessage = {
  type: "message";
  roomId: string;
  message: string;
  userId: string;
  timestamp: number;
};

type ChatMessageReceived = {
  type: "messageReceived";
  message: string;
  userId: string;
  timestamp: number;
};

type VideoPlayMessage = {
  type: "play";
  roomId: string;
  currentTime: number;
  userId: string;
};

type VideoPauseMessage = {
  type: "pause";
  roomId: string;
  currentTime: number;
  userId: string;
};

type VideoSyncReceived = {
  type: "videoSync";
  action: "play" | "pause";
  currentTime: number;
  userId: string;
};

type Message =
  | ConnectToRoomMessage
  | SetVideoUrlMessage
  | ChatMessage
  | ChatMessageReceived
  | VideoPlayMessage
  | VideoPauseMessage
  | VideoSyncReceived
  | GenericMessage;
