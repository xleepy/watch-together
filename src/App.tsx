import { useState } from "react";
import "./App.css";
import { CreateRoom } from "./CreateRoom";
import { Room } from "./Room";
import { MessagesProvider } from "./MessagesProvider";

function App() {
  const [roomId, setRoomId] = useState<string | null>(null);

  if (!roomId) {
    return <CreateRoom onCreate={setRoomId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{`Your room id ${roomId}`}</p>
      <MessagesProvider roomId={roomId}>
        <Room roomId={roomId} />
      </MessagesProvider>
    </div>
  );
}

export default App;
