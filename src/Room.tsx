import { useState } from "react";
import { useMessagesContext } from "./MessagesProvider";

type RoomProps = {
  roomId: string;
};

const AttachUrl = ({ roomId }: RoomProps) => {
  const { dispatchMessage } = useMessagesContext();
  const [currentUrl, setCurrentUrl] = useState("");
  return (
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
            roomId: roomId,
            url: currentUrl,
          });
        }}
      >
        Set Video URL
      </button>
    </>
  );
};

export const Room = ({ roomId }: RoomProps) => {
  const { state } = useMessagesContext();

  console.log("Room state:", state);

  if (!state.url) {
    return <AttachUrl roomId={roomId} />;
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
