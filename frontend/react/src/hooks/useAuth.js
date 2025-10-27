import { useEffect } from "react";
import { checkAuthStatus, authenticateWithPin } from "../utils/api";

export const useAuth = (onAuthComplete) => {
  useEffect(() => {
    const ensureAuth = async () => {
      try {
        const st = await checkAuthStatus();
        if (!st) {
          onAuthComplete();
          return;
        }
        if (st.pin_required && !st.authed) {
          const pin = window.prompt("Enter access PIN:") || "";
          const success = await authenticateWithPin(pin);
          if (!success) {
            return { authed: false, message: "Invalid PIN" };
          }
        }
        onAuthComplete();
      } catch (e) {
        console.warn("ensureAuth", e);
        onAuthComplete();
      }
    };

    ensureAuth();
  }, [onAuthComplete]);
};
