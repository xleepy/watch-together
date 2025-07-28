import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { useClientDispatch } from "../providers";
import "./Chat.css";

type ChatProps = {
  className?: string;
};

export const Chat = ({ className }: ChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useAppStore((state) => state.messages);
  const roomId = useAppStore((state) => state.roomId);
  const userId = useAppStore((state) => state.userId);
  const dispatchMessage = useClientDispatch();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className={`chat-container ${className}`}>
      <h3>Chat</h3>
      <div className="chat-container__messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="chat-container__message"
            style={{
              alignSelf: msg.userId === userId ? "flex-end" : "flex-start",
            }}
          >
            <div className="chat-container__message-user">
              {msg.userId} • {formatTime(msg.timestamp)}
            </div>
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-container__form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-container__form-input"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="chat-container__form-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
};
