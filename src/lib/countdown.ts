import { useEffect, useState } from "react";

export const LAUNCH_DATE = new Date("2026-08-01T13:30:00-04:00"); // 1:30 PM EDT (Eastern)

export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    const tick = () => {
      const dist = LAUNCH_DATE.getTime() - Date.now();
      if (dist <= 0) {
        setIsComplete(true);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      setIsComplete(false);
      setTimeLeft({
        days:    String(Math.floor(dist / 86400000)).padStart(2, "0"),
        hours:   String(Math.floor((dist % 86400000) / 3600000)).padStart(2, "0"),
        minutes: String(Math.floor((dist % 3600000) / 60000)).padStart(2, "0"),
        seconds: String(Math.floor((dist % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { timeLeft, isComplete };
}
