import { useState } from "react";
import type { ChangeEvent } from "react";
import { useClient } from "../providers";
import { useParams } from "react-router";
import { basePath } from "../../constants";

export const AttachUrl = () => {
  const { dispatchMessage } = useClient();
  const { roomId } = useParams<{ roomId: string }>();
  const [currentUrl, setCurrentUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError(null);
  };

  const uploadVideo = async () => {
    if (!selectedFile || !roomId) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${basePath}/rooms/${roomId}/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentage);
          } else {
            setUploadProgress(null);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            let errorMessage = "Failed to upload video";
            try {
              const payload = JSON.parse(xhr.responseText);
              if (payload?.error) {
                errorMessage = payload.error;
              }
            } catch {
              // noop
            }
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading video"));
        };

        xhr.send(formData);
      });

      setSelectedFile(null);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unexpected error"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const broadcastUrl = () => {
    if (!currentUrl || !roomId) {
      return;
    }

    dispatchMessage({
      type: "setVideoUrl",
      roomId: roomId,
      url: currentUrl,
      origin: "manual",
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
      <hr />
      <div>
        <label>
          <span>Select a video file</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        <button
          onClick={uploadVideo}
          disabled={!selectedFile || isUploading || !roomId}
        >
          {isUploading ? "Uploading..." : "Upload and Share"}
        </button>
        {typeof uploadProgress === "number" ? (
          <div>
            <progress max={100} value={uploadProgress} />
            <span>{uploadProgress}%</span>
          </div>
        ) : null}
        {selectedFile ? <p>Selected: {selectedFile.name}</p> : null}
        {uploadError ? <p role="alert">{uploadError}</p> : null}
      </div>
    </>
  );
};
