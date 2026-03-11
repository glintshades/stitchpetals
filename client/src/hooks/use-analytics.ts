import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

export function useAnalytics() {
  const [location] = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (lastTracked.current === location) return;
    lastTracked.current = location;

    const sessionId = getSessionId();
    const referrer = document.referrer;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location, referrer, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [location]);
}
