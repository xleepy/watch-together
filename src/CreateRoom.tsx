import { userId } from "./constants";
import { useMessagesContext } from "./MessagesProvider";

export const CreateRoom = () => {
  const { dispatchMessage } = useMessagesContext();

  const createRoom = () => {
    dispatchMessage({ type: "create", roomId: userId });
  };

  return <button onClick={createRoom}>Create room</button>;
};
