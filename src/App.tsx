import "./App.css";
import { CreateRoom } from "./CreateRoom";
import { useMessagesContext } from "./MessagesProvider";
import { Room } from "./Room";

function App() {
  const { state } = useMessagesContext();

  if (!state.isConnected) {
    return <CreateRoom />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{state.roomId}</p>
      <Room />
    </div>
  );
}

export default App;
