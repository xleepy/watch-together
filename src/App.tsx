import { useState } from "react";
import "./App.css";
import { CreateRoom } from "./CreateRoom";
import { useMessagesContext } from "./MessagesProvider";

function App() {
  const { state, dispatchMessage } = useMessagesContext();
  const [currentUrl, setCurrentUrl] = useState("");

  if (!state.isConnected) {
    return <CreateRoom />;
  }

  console.log("App state:", state);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <p>{state.roomId}</p>
      {!state.url && (
        <>
          <input
            type="text"
            placeholder="set url to watch"
            value={currentUrl}
            onChange={(event) => setCurrentUrl(event.target.value)}
          />
          <button
            disabled={!currentUrl}
            onClick={() => {
              dispatchMessage({
                type: "setVideoUrl",
                roomId: state.roomId,
                videoUrl: currentUrl,
              });
            }}
          >
            Set Video URL
          </button>
        </>
      )}
      {state.url && (
        <video
          autoPlay
          className="video"
          src={state.url}
          crossOrigin="anonymous"
          controls
        />
      )}
    </div>
  );
}

export default App;
