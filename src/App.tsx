import "./App.css";
import { useClient } from "./ClientProvider";
import { CreateRoom } from "./CreateRoom";
import { Room } from "./Room";

function App() {
  const { state } = useClient();
  if (!state.isConnected) {
    return <CreateRoom />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{`Your room id ${state.roomId}`}</p>
      <Room />
    </div>
  );
}

export default App;
