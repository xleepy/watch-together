import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAppStore } from "../../store";
import { host } from "../../constants";

const port = import.meta.env.VITE_PORT || 3000;

type ClientProviderContextValue = {
  dispatchMessage: (message: GenericMessage) => void;
  client: WebSocket | null;
};

export const ClientProviderContext =
  createContext<ClientProviderContextValue | null>(null);

interface ClientProviderProps extends PropsWithChildren {
  roomId?: string;
}


export const ClientProvider = ({ children, roomId }: ClientProviderProps) => {
  const [client, setClient] = useState<WebSocket | null>(null);
  const dispatch = useAppStore((state) => state.dispatch);
  const userId = useAppStore((state) => state.userId);
  useEffect(() => {
    const client = new WebSocket(`ws://${host}:${port}`);
    client.onopen = () => {
      console.log("WebSocket connection opened");
      client.send(JSON.stringify({ type: "connected", roomId }))
    };

    const handleGenericMessage = (message: MessageEvent<string>) => {
      try {
        const receivedMsg: Message = JSON.parse(message.data);
        const playerEvents = ["play", "pause", "videoSync"]
        const sameUser = 'userId' in receivedMsg && receivedMsg.userId === userId
        if (playerEvents.includes(receivedMsg.type) || sameUser) {
          // Ignore messages sent by self
          return;
        }
        dispatch(receivedMsg);
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    }

    client.addEventListener('message', handleGenericMessage);
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setClient(client);
    return () => {
      client.removeEventListener('message', handleGenericMessage);
      client.close();
      console.log("WebSocket connection closed");
    };
  }, [dispatch, roomId, userId]);

  const dispatchMessage = useCallback(
    (message: GenericMessage) => {
      if (!client || client.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot send message:", message);
        return;
      }
      try {
        const messageString = JSON.stringify(message);
        client.send(messageString);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [client]
  );

  const contextValue = useMemo(() => {
    return {
      dispatchMessage,
      client
    }
  }, [client, dispatchMessage]);

  if (!client || client.readyState === WebSocket.CLOSED) {
    return <div>Connection closed or not established</div>;
  }
  return (
    <ClientProviderContext.Provider value={contextValue}>
      {children}
    </ClientProviderContext.Provider>
  );
};
