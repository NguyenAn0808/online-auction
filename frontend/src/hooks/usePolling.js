import { useEffect, useRef } from "react";

/**
 * Simple polling hook
 * @param {Function} callback - Function to call on each poll
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} active - Whether polling is active
 */
export const usePolling = (callback, interval, active = true) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active || !interval) return;

    const tick = async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Call immediately
    tick();

    // Then poll at interval
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, active]);
};

export default usePolling;
