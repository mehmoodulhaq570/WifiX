// API helper functions

export const getApiBase = () => {
  try {
    return (
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_URL) ||
      window.location.origin
    );
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
