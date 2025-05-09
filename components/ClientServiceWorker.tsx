//component to initialize service worker for firebase cloud messaging
"use client";

import { useEffect } from "react";

const ClientServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(" Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
          console.error(" Service Worker registration failed:", err);
        });
    }
  }, []);

  return null; 
};

export default ClientServiceWorker;