// API helper functions

export const getApiBase = () => {
  try {
    const configured =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_URL;

    if (configured) {
      const url = new URL(configured, window.location.origin);
      const pageHost = window.location.hostname;
      const configuredHost = url.hostname;
      const configuredIsLocal =
        configuredHost === "localhost" || configuredHost === "127.0.0.1";
      const pageIsLocal = pageHost === "localhost" || pageHost === "127.0.0.1";

      if (configuredIsLocal && !pageIsLocal) {
        url.hostname = pageHost;
        return url.toString().replace(/\/$/, "");
      }

      return configured.replace(/\/$/, "");
    }

    const url = new URL(window.location.origin);
    if (!url.port || url.port === "5173" || url.port === "5174") {
      url.port = "5000";
    }
    return url.toString().replace(/\/$/, "");
  } catch (e) {
    return window.location.origin;
  }
};

export const fetchDeviceInfo = async () => {
  try {
    const infoRes = await fetch(`${getApiBase().replace(/\/$/, "")}/info`, {
      credentials: "include",
    });
    if (infoRes.ok) {
      return await infoRes.json();
    }
  } catch (e) {
    console.warn("fetch /info failed", e);
  }
  return null;
};

export const fetchFiles = async () => {
  try {
    const res = await fetch(`${getApiBase().replace(/\/$/, "")}/files`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("fetch files failed");
    const items = await res.json();
    // normalize into local file shape
    return (items || []).map((it) => ({
      name: it.filename || it.name,
      url: it.url || null,
      size: it.size || 0,
      mtime: it.mtime ? it.mtime * 1000 : Date.now(),
      type: it.type || "file",
      has_pin: it.has_pin || false,
    }));
  } catch (e) {
    console.warn("loadFiles", e);
    return [];
  }
};

export const deleteFile = async (filename) => {
  const apiBase = getApiBase().replace(/\/$/, "");
  const res = await fetch(`${apiBase}/delete/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    let msg = `Delete failed: ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch (e) {}
    throw new Error(msg);
  }
  return true;
};

export const checkAuthStatus = async () => {
  const res = await fetch(`${getApiBase().replace(/\/$/, "")}/auth/status`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return await res.json();
};

export const authenticateWithPin = async (pin) => {
  const r = await fetch(`${getApiBase().replace(/\/$/, "")}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
    credentials: "include",
  });
  return r.ok;
};

export const requestHostConnection = async ({ sid, name = "Guest" }) => {
  const res = await fetch(`${getApiBase()}/connect/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sid, name }),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(
      data.reason === "no_host"
        ? "No host is available. Click Become Host on the host device first."
        : data.message || "Failed to send connection request"
    );
  }
  return data;
};

export const fetchPendingConnectionRequests = async () => {
  const res = await fetch(`${getApiBase()}/connect/pending`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

export const respondToConnectionRequest = async (id, decision) => {
  const res = await fetch(`${getApiBase()}/connect/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, decision }),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error("Failed to send response");
  }
  return data;
};

export const fetchConnectionRequestStatus = async (id) => {
  const res = await fetch(`${getApiBase()}/connect/status/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (!res.ok) return { status: "unknown" };
  return await res.json();
};
