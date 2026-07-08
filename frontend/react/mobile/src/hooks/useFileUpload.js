import { useState } from "react";
import { getApiBase } from "../utils/api";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../utils/constants";

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file, pin = null) => {
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
          console.log('XHR onload - Status:', xhr.status, 'Response:', xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              console.log('Parsed response:', json);
              const savedName = json.filename || json.name || null;
              const url = json.url || json.data?.url || null;
              const hasPin = json.has_pin || false;
              resolve({
                success: true,
                filename: savedName,
                url: url,
                size: file.size || 0,
                type: file.type || "file",
                has_pin: hasPin,
              });
            } catch (err) {
              console.error('Failed to parse response:', err, 'Response text:', xhr.responseText);
              reject(new Error("Failed to parse server response: " + err.message));
            }
          } else {
            let errorMsg = `Upload failed (${xhr.status}): ${xhr.statusText}`;
            try {
              const errorJson = JSON.parse(xhr.responseText);
              if (errorJson.error) {
                errorMsg = errorJson.error;
              }
            } catch (e) {
              // Use default error message
            }
            console.error('Upload failed:', errorMsg, 'Response:', xhr.responseText);
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = function () {
          console.error('XHR error occurred');
          reject(new Error("Network error - please check your connection and ensure the server is running"));
        };

        xhr.ontimeout = function () {
          console.error('XHR timeout');
          reject(new Error("Upload timeout - file may be too large or connection too slow"));
        };

        const fd = new FormData();
        fd.append("file", file);
        if (pin) {
          fd.append("pin", pin);
        }
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
