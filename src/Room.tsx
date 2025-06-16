import { useState, useEffect, useRef } from "react";
import { useClientDispatch } from "./ClientProvider";
import { useAppStore } from "./store";

const AttachUrl = () => {
  const dispatchMessage = useClientDispatch();
  const roomId = useAppStore((state) => state.roomId);
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

const EditUrl = () => {
  const dispatchMessage = useClientDispatch();
  const url = useAppStore((state) => state.url);
  const roomId = useAppStore((state) => state.roomId);
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
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Enter new video URL"
        value={editUrl}
        onChange={(event) => setEditUrl(event.target.value)}
        style={{ marginRight: "0.5rem", padding: "0.5rem", minWidth: "300px" }}
      />
      <button
        disabled={!editUrl}
        onClick={handleSubmit}
        style={{ marginRight: "0.5rem" }}
      >
        Submit
      </button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useAppStore((state) => state.messages);
  const roomId = useAppStore((state) => state.roomId);
  const userId = useAppStore((state) => state.userId);
  const dispatchMessage = useClientDispatch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !userId) {
      return;
    }

    dispatchMessage({
      type: "message",
      roomId: roomId,
      message: newMessage.trim(),
      userId: userId,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        height: "300px",
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Chat</h3>
      </div>

      <div
        style={{
          flex: 1,
          padding: "0.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              backgroundColor: msg.userId === userId ? "#e3f2fd" : "#f5f5f5",
              alignSelf: msg.userId === userId ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "#666",
                marginBottom: "0.25rem",
              }}
            >
              {msg.userId} • {formatTime(msg.timestamp)}
            </div>
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "0.5rem",
          borderTop: "1px solid #ccc",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

const SynchronizedVideoPlayer = () => {
  const videoState = useAppStore((state) => state.videoState);
  const dispatchMessage = useClientDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSyncRef = useRef<number>(0);
  const isUserActionRef = useRef<boolean>(false);
  const roomId = useAppStore((state) => state.roomId);
  const userId = useAppStore((state) => state.userId);
  const url = useAppStore((state) => state.url);

  // Handle incoming video sync messages
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.lastUpdated) return;

    // Avoid infinite loops by checking if this is a recent sync
    if (Date.now() - lastSyncRef.current < 500) return;

    lastSyncRef.current = Date.now();
    isUserActionRef.current = false; // This is a sync, not user action

    const { isPlaying, currentTime } = videoState;

    // Sync the video time if there's a significant difference
    if (Math.abs(video.currentTime - currentTime) > 1) {
      video.currentTime = currentTime;
    }

    // Sync play/pause state
    if (isPlaying && video.paused) {
      video.play().catch(console.error);
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [videoState]);

  const handlePlay = () => {
    if (!isUserActionRef.current) {
      isUserActionRef.current = true;
      return; // This was triggered by sync, don't send message
    }

    const video = videoRef.current;
    if (!video || !roomId || !userId) return;

    dispatchMessage({
      type: "play",
      roomId: roomId,
      currentTime: video.currentTime,
      userId: userId,
    });
  };

  const handlePause = () => {
    if (!isUserActionRef.current) {
      isUserActionRef.current = true;
      return; // This was triggered by sync, don't send message
    }

    const video = videoRef.current;
    if (!video || !roomId || !userId) return;

    dispatchMessage({
      type: "pause",
      roomId: roomId,
      currentTime: video.currentTime,
      userId: userId,
    });
  };

  const handleUserPlay = () => {
    isUserActionRef.current = true;
    handlePlay();
  };

  const handleUserPause = () => {
    isUserActionRef.current = true;
    handlePause();
  };

  return (
    <video
      ref={videoRef}
      className="video"
      src={url}
      crossOrigin="anonymous"
      controls
      onPlay={handleUserPlay}
      onPause={handleUserPause}
      style={{ width: "100%", maxWidth: "800px" }}
    />
  );
};

export const Room = () => {
  const url = useAppStore((state) => state.url);

  if (!url) {
    return <AttachUrl />;
  }

  return (
    <div>
      <EditUrl />
      <SynchronizedVideoPlayer />
      <Chat />
    </div>
  );
};
