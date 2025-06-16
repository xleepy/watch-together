import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  isConnected: boolean;
  roomId?: string;
  url?: string;
  userId?: string;
  messages: Array<{
    message: string;
    userId: string;
    timestamp: number;
  }>;
  videoState: {
    isPlaying: boolean;
    currentTime: number;
    lastUpdated: number;
  };
  dispatch: (
    args:
      | ConnectToRoomMessage
      | SetVideoUrlMessage
      | ChatMessageReceived
      | VideoSyncReceived
      | GenericMessage
  ) => void;
}

export const messagesReducer = (state: AppState, action: Message): AppState => {
  switch (action.type) {
    case "created":
    case "joined": {
      const connectAction = action as ConnectToRoomMessage;
      return {
        ...state,
        isConnected: true,
        roomId: connectAction.roomId,
        url: connectAction.url,
        userId: state.userId || uuidv4(),
      };
    }
    case "setVideoUrl": {
      const setVideoUrlAction = action as SetVideoUrlMessage;
      return {
        ...state,
        url: setVideoUrlAction.url,
      };
    }
    case "messageReceived": {
      const messageAction = action as ChatMessageReceived;
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            message: messageAction.message,
            userId: messageAction.userId,
            timestamp: messageAction.timestamp,
          },
        ],
      };
    }
    case "videoSync": {
      const videoAction = action as VideoSyncReceived;
      return {
        ...state,
        videoState: {
          isPlaying: videoAction.action === "play",
          currentTime: videoAction.currentTime,
          lastUpdated: Date.now(),
        },
      };
    }
    default:
      return state;
  }
};

export const useAppStore = create<AppState>((set) => {
  return {
    isConnected: false,
    roomId: undefined,
    url: undefined,
    userId: undefined,
    messages: [],
    videoState: {
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now(),
    },
    dispatch: (args: GenericMessage) => {
      set((state) => messagesReducer(state, args));
    },
  };
});
