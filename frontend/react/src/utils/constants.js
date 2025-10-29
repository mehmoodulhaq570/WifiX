// File size limits
export const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB
export const MAX_FILE_SIZE_MB = 100;

// API endpoints
export const API_ENDPOINTS = {
  INFO: "/info",
  FILES: "/files",
  UPLOAD: "/upload",
  DELETE: "/delete",
  AUTH: "/auth",
  AUTH_STATUS: "/auth/status",
  AUTH_LOGOUT: "/auth/logout",
  QR: "/qr",
};

// Socket events
export const SOCKET_EVENTS = {
  // Outgoing
  BECOME_HOST: "become_host",
  STOP_HOST: "stop_host",
  REQUEST_CONNECT: "request_connect",
  APPROVE_REQUEST: "approve_request",
  DENY_REQUEST: "deny_request",

  // Incoming
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  FILE_UPLOADED: "file_uploaded",
  FILE_DELETED: "file_deleted",
  REQUEST_APPROVED: "request_approved",
  REQUEST_DENIED: "request_denied",
  INCOMING_REQUEST: "incoming_request",
  HOST_STATUS: "host_status",
  HOST_ACCEPTED: "host_accepted",
};
