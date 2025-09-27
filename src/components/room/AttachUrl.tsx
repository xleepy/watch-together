import { useState } from "react";
import { useClientDispatch } from "../providers";
import { useParams } from "react-router";

export const AttachUrl = () => {
  const dispatchMessage = useClientDispatch();
  const { roomId } = useParams<{ roomId: string }>();
  const [currentUrl, setCurrentUrl] = useState("");

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
