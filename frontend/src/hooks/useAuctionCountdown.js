import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for countdown timer to auction end time
 * @param {string|Date} endTime - The auction end time
 * @param {function} onEnd - Callback when auction ends
 */
export const useAuctionCountdown = (endTime, onEnd) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasEnded, setHasEnded] = useState(false);
  const onEndRef = useRef(onEnd);

  // Keep onEndRef up to date
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const calculateTimeRemaining = useCallback(() => {
    if (!endTime) return null;

    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      if (!hasEnded) {
        setHasEnded(true);
        if (onEndRef.current) onEndRef.current();
      }
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        formatted: "Auction Ended",
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format time string
    let formatted = "";
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      total: diff,
      formatted,
    };
  }, [endTime, hasEnded]);

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  return {
    timeRemaining,
    hasEnded,
    isEndingSoon: timeRemaining && timeRemaining.total < 3600000, // Less than 1 hour
    isCritical: timeRemaining && timeRemaining.total < 300000, // Less than 5 minutes
  };
};
