import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface AppState {
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
    case "joined-room":
    case "created-room": {
      const createdAction = action as ConnectToRoomMessage;
      return {
        ...state,
        roomId: createdAction.roomId,
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
    roomId: undefined,
    url: undefined,
    userId: uuidv4(),
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
