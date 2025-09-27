import { useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import { useClientDispatch } from "../providers";
import classNames from "classnames";
import "./Player.css";
import { useParams } from "react-router";

type PlayerProps = {
  className?: string;
};

export const Player = ({ className }: PlayerProps) => {
  const videoState = useAppStore((state) => state.videoState);
  const dispatchMessage = useClientDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSyncRef = useRef<number>(0);
  const isUserActionRef = useRef<boolean>(false);
  const { roomId } = useParams<{ roomId: string }>();
  const userId = useAppStore((state) => state.userId);
  const url = useAppStore((state) => state.url);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    lastSyncRef.current = Date.now();
    isUserActionRef.current = false;

    const { isPlaying, currentTime } = videoState;

    if (Math.abs(video.currentTime - currentTime) > 1) {
      video.currentTime = currentTime;
    }

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
      className={classNames("player", className)}
      src={url}
      crossOrigin="anonymous"
      controls
      onPlay={handleUserPlay}
      onPause={handleUserPause}
    />
  );
};
