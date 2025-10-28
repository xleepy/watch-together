import { use, useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { useClient } from "../providers";
import classNames from "classnames";
import "./Player.css";
import { useParams } from "react-router";

type PlayerProps = {
  className?: string;
};

type PlayerEvents = VideoPlayMessage | VideoPauseMessage | VideoSyncReceived;

export const Player = ({ className }: PlayerProps) => {
  const { dispatchMessage, client } = useClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const userId = useAppStore((state) => state.userId);
  const url = useAppStore((state) => state.url);

  useEffect(() => {
    const video = videoRef.current;
    if (!client || !video) {
      return;
    }

    console.log('here')
    video.click()

    const handlePlayerMessage = (event: MessageEvent<string>) => {
      const { dispatch } = useAppStore.getState();
      try {
        const receivedMsg: PlayerEvents = JSON.parse(event.data);
        const sameUser = 'userId' in receivedMsg && receivedMsg.userId === userId
        console.log("Received message:", receivedMsg);
        console.log('is same user:', sameUser)
        if (sameUser) {
          // Ignore messages sent by self
          return;
        }

        const { action, currentTime, type } = receivedMsg as any
        if (type === "videoSync") {
          video.currentTime = currentTime;
          if (action === "play") {
            video.play();
          } else {
            video.pause();
          }
        }

        dispatch(receivedMsg);
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    }

    client.addEventListener('message', handlePlayerMessage)
    return () => {
      client.removeEventListener('message', handlePlayerMessage);
    }
  }, [client, userId]);


  const handlePlay = () => {
    const video = videoRef.current;
    if (!video || !roomId || !userId) return;
    console.log("Dispatching play message");

    dispatchMessage({
      type: "play",
      roomId: roomId,
      currentTime: video.currentTime,
      userId: userId,
    });
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video || !roomId || !userId) return;

    dispatchMessage({
      type: "pause",
      roomId: roomId,
      currentTime: video.currentTime,
      userId: userId,
    });
  };

  return (
    <video
      ref={videoRef}
      className={classNames("player", className)}
      src={url}
      crossOrigin="anonymous"
      controls
      onPlay={handlePlay}
      onPause={handlePause}
    />
  );
};
