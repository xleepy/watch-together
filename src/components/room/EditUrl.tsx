import { useState } from "react";
import { useAppStore } from "../../store";
import { useClient } from "../providers";
import "./EditUrl.css";
import { useParams } from "react-router";

export const EditUrl = () => {
  const { dispatchMessage } = useClient();
  const url = useAppStore((state) => state.url);
  const { roomId } = useParams<{ roomId: string }>();
  const [editUrl, setEditUrl] = useState(url || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    if (!editUrl || !roomId) {
      return;
    }

    dispatchMessage({
      type: "setVideoUrl",
      roomId: roomId,
      url: editUrl,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUrl(url || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return <button onClick={() => setIsEditing(true)}>Edit Video URL</button>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter new video URL"
        value={editUrl}
        className="edit-url__field"
        onChange={(event) => setEditUrl(event.target.value)}
      />
      <button
        disabled={!editUrl}
        onClick={handleSubmit}
        className="edit-url__btn"
      >
        Submit
      </button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};
