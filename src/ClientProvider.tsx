import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react";

interface AppState {
  isConnected: boolean;
  roomId?: string;
  url?: string;
}

type MessageContextValue = {
  state: AppState;
  dispatchMessage: (msg: GenericMessage) => void;
};

const MessagesContext = createContext<MessageContextValue | null>(null);

const port = import.meta.env.VITE_PORT || 3000;

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
      };
    }
    case "setVideoUrl": {
      const setVideoUrlAction = action as SetVideoUrlMessage;
      return {
        ...state,
        url: setVideoUrlAction.url,
      };
    }
    default:
      return state;
  }
};

const initialState: AppState = {
  isConnected: false,
};

export const ClientProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<WebSocket | null>(null);
  const [state, dispatch] = useReducer(messagesReducer, initialState);
  useEffect(() => {
    const client = new WebSocket(`ws://localhost:${port}`);
    client.onopen = () => {
      console.log("WebSocket connection opened");
    };
    client.onmessage = (event) => {
      try {
        const receivedMsg: GenericMessage = JSON.parse(event.data);
        console.log("Received raw message:", receivedMsg);
        dispatch(receivedMsg);
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setClient(client);
    return () => {
      client.close();
      console.log("WebSocket connection closed");
    };
  }, []);

  const dispatchMessage = useCallback(
    (msg: GenericMessage) => {
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    },
    [client]
  );

  const contextValue: MessageContextValue = useMemo(() => {
    return { state, dispatchMessage };
  }, [state, dispatchMessage]);

  if (!client || client.readyState === WebSocket.CLOSED) {
    return <div>Connection closed or not established</div>;
  }
  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error(
      "useMessagesContext must be used within a MessagesProvider"
    );
  }
  return context;
};
