import { useState } from "react";
import { useClient } from "./ClientProvider";

const AttachUrl = () => {
  const { dispatchMessage, state } = useClient();
  const [currentUrl, setCurrentUrl] = useState("");
  const roomId = state.roomId;
  const broadcastUrl = () => {
    if (!currentUrl || !roomId) {
      return;
    }

    dispatchMessage({
      type: "setVideoUrl",
      roomId: roomId,
      url: currentUrl,
    });
  };
  return (
    <>
      <input
        type="text"
        placeholder="set url to watch"
        value={currentUrl}
        onChange={(event) => setCurrentUrl(event.target.value)}
      />
      <button disabled={!currentUrl} onClick={broadcastUrl}>
        Set Video URL
      </button>
    </>
  );
};

export const Room = () => {
  const { state } = useClient();

  console.log("Room state:", state);

  if (!state.url) {
    return <AttachUrl />;
  }

  return (
    <video
      autoPlay
      className="video"
      src={state.url}
      crossOrigin="anonymous"
      controls
    />
  );
};
