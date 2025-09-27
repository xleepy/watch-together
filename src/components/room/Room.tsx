import { useAppStore } from "../../store";
import { Player } from "../player";
import { Chat } from "../chat";
import { AttachUrl } from "./AttachUrl";
import { EditUrl } from "./EditUrl";
import "./Room.css";
import { ClientProvider, } from "../providers";
import { useParams } from "react-router";
import { useEffect } from "react";
import { basePath } from "../../constants";


const RoomInternal = () => {
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



export const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useAppStore((state) => state.dispatch);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    const abortController = new AbortController();

    const fetchRoomDetails = async () => {
      try {
        const roomDetails = await fetch(`${basePath}/rooms/${roomId}`, {
          method: "GET",
          signal: abortController.signal,
        });
        if (!roomDetails.ok) {
          throw new Error("Failed to fetch room details");
        }
        const { url } = await roomDetails.json();
        if (url) {
          // Update the store with the fetched URL
          dispatch({ type: 'setVideoUrl', url })
        }
      } catch (error) {
        const respError = error as Error
        if (respError.name === 'AbortError') {
        } else {
          console.error("Error fetching room details:", error);
        }
      }
    }
    fetchRoomDetails();
    return () => {
      abortController.abort();
    };
  }, [roomId, dispatch])

  return <ClientProvider roomId={roomId}>
    <div className="id-container">{`Your room id is ${roomId}`}</div>
    <RoomInternal />
  </ClientProvider>
}