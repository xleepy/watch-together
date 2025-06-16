import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useAppStore } from "./store";

const port = import.meta.env.VITE_PORT || 3000;

type ClientProviderContextValue = (message: GenericMessage) => void;

const ClientProviderContext = createContext<ClientProviderContextValue | null>(
  null
);

export const ClientProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<WebSocket | null>(null);
  const dispatch = useAppStore((state) => state.dispatch);
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
  }, [dispatch]);

  const dispatchMessage = useCallback(
    (message: GenericMessage) => {
      if (!client || client.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot send message:", message);
        return;
      }
      try {
        const messageString = JSON.stringify(message);
        console.log("Sending message:", messageString);
        client.send(messageString);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [client]
  );

  if (!client || client.readyState === WebSocket.CLOSED) {
    return <div>Connection closed or not established</div>;
  }
  return (
    <ClientProviderContext.Provider value={dispatchMessage}>
      {children}
    </ClientProviderContext.Provider>
  );
};

export const useClientDispatch = () => {
  const context = useContext(ClientProviderContext);
  if (!context) {
    throw new Error("useClientDispatch must be used within a ClientProvider");
  }
  return context;
};
