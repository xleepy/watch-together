import { useState } from "react";
import { useAppStore } from "../../store";
import { useNavigate } from "react-router";
import { basePath } from "../../constants";


export const CreateRoom = () => {
  const dispatch = useAppStore((state) => state.dispatch);
  const navigate = useNavigate()
  const createRoom = async () => {
    try {
      const response = await fetch(`${basePath}/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to create room");

      }
      const { roomId } = await response.json();
      dispatch({ type: "created-room", roomId, });
      navigate(`/room/${roomId}`)
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
  const dispatch = useAppStore((state) => state.dispatch);
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState("");

  const joinRoom = async () => {
    const response = await fetch(`${basePath}/join-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId })
    })
    if (!response.ok) {
      console.error("Failed to join room");
      return;
    }
    const { roomId: joinedRoomId, url } = await response.json();
    dispatch({ type: "joined-room", roomId: joinedRoomId, url });
    navigate(`/room/${joinedRoomId}`)

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
