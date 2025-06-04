import { useState } from "react";
import { useClient } from "./ClientProvider";

export const CreateRoom = () => {
  const { dispatchMessage } = useClient();
  const createRoom = async () => {
    try {
      dispatchMessage({ type: "create" });
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div>
      <button onClick={createRoom}>Create room</button>
      <p>or</p>
      <JoinRoom />
    </div>
  );
};

const JoinRoom = () => {
  const { dispatchMessage } = useClient();
  const [roomId, setRoomId] = useState("");
  const joinRoom = async () => {
    dispatchMessage({ type: "join", roomId });
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom} disabled={!roomId}>
        Join Room
      </button>
    </div>
  );
};
