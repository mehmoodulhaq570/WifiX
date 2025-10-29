import { useState } from "react";
import { getApiBase } from "../utils/api";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../utils/constants";

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large (max ${MAX_FILE_SIZE_MB}MB)`);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiBase = getApiBase().replace(/\/$/, "");
        xhr.open("POST", `${apiBase}/upload`, true);

        // Enable credentials for session cookies
        xhr.withCredentials = true;

        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              const savedName = json.filename || json.name || null;
              const url = json.url || json.data?.url || null;
              resolve({
                success: true,
                filename: savedName,
                url: url,
                size: file.size || 0,
                type: file.type || "file",
              });
            } catch (err) {
              reject(new Error("Failed to parse server response"));
            }
          } else {
            reject(new Error("Upload failed: " + xhr.statusText));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Upload error"));
        };

        const fd = new FormData();
        fd.append("file", file);
        xhr.send(fd);
      });

      setIsUploading(false);
      setUploadProgress(0);
      return result;
    } catch (e) {
      setIsUploading(false);
      setUploadProgress(0);
      throw e;
    }
  };

  return {
    uploadFile,
    uploadProgress,
    isUploading,
  };
};
