import { useState } from "react";

type CreateRoomProps = {
  onCreate: (roomId: string) => void;
};

export const CreateRoom = ({ onCreate }: CreateRoomProps) => {
  const createRoom = async () => {
    try {
      const resp = await fetch("http://localhost:3000/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to create room");
      }
      const data = await resp.json();
      onCreate(data.roomId);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div>
      <button onClick={createRoom}>Create room</button>
      <p>or</p>
      <JoinRoom onCreate={onCreate} />
    </div>
  );
};

const JoinRoom = ({ onCreate }: CreateRoomProps) => {
  const [roomId, setRoomId] = useState("");
  const joinRoom = async () => {
    try {
      await fetch(`http://localhost:3000/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      });
      console.log("Joining room with ID:", roomId);
      onCreate(roomId);
    } catch (error) {
      console.error("Error joining room:", error);
    }
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
