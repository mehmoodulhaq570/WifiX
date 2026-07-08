import { useEffect, useRef } from "react";
import { checkAuthStatus, authenticateWithPin } from "../utils/api";

export const useAuth = (onAuthComplete) => {
  const onAuthCompleteRef = useRef(onAuthComplete);

  useEffect(() => {
    onAuthCompleteRef.current = onAuthComplete;
  }, [onAuthComplete]);

  useEffect(() => {
    const ensureAuth = async () => {
      try {
        const st = await checkAuthStatus();
        if (!st) {
          onAuthCompleteRef.current();
          return;
        }
        if (st.pin_required && !st.authed) {
          const pin = window.prompt("Enter access PIN:") || "";
          const success = await authenticateWithPin(pin);
          if (!success) {
            return { authed: false, message: "Invalid PIN" };
          }
        }
        onAuthCompleteRef.current();
      } catch (e) {
        console.warn("ensureAuth", e);
        onAuthCompleteRef.current();
      }
    };

    ensureAuth();
  }, []);
};
