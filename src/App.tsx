import "./App.css";
import { CreateRoom } from "./components/create-room/CreateRoom";
import { Room } from "./components/room/Room";
import { useAppStore } from "./store";

function App() {
  const isConnected = useAppStore((state) => state.isConnected);
  const roomId = useAppStore((state) => state.roomId);
  if (!isConnected) {
    return <CreateRoom />;
  }

  return (
    <div className="app">
      <p>{`Your room id ${roomId}`}</p>
      <Room />
    </div>
  );
}

export default App;
