import { useState } from "react";
import { useMessagesContext } from "./MessagesProvider";

export const Room = () => {
  const { state, dispatchMessage } = useMessagesContext();
  const [currentUrl, setCurrentUrl] = useState("");

  return (
    <>
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
    </>
  );
};
