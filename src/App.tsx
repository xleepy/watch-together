import "./App.css";
import { CreateRoom } from "./CreateRoom";
import { Room } from "./Room";
import { useAppStore } from "./store";

function App() {
  const isConnected = useAppStore((state) => state.isConnected);
  const roomId = useAppStore((state) => state.roomId);
  if (!isConnected) {
    return <CreateRoom />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{`Your room id ${roomId}`}</p>
      <Room />
    </div>
  );
}

export default App;
