import { useAppStore } from "../../store";
import { Player } from "../player";
import { Chat } from "../chat";
import { AttachUrl } from "./AttachUrl";
import { EditUrl } from "./EditUrl";
import "./Room.css";

export const Room = () => {
  const url = useAppStore((state) => state.url);

  if (!url) {
    return <AttachUrl />;
  }

  return (
    <div className="room-container">
      <div className="room-container__video">
        <EditUrl />
        <Player />
      </div>
      <Chat />
    </div>
  );
};
