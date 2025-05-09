importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
        apiKey: "AIzaSyACsD1pEkxbUv06J5tf9drI-DPA5XT5XDc",
        authDomain: "rideeazy-2e644.firebaseapp.com",
        projectId: "rideeazy-2e644",
        storageBucket: "rideeazy-2e644.firebasestorage.app",
        messagingSenderId: "148448331591",
        appId: "1:148448331591:web:30cf368d684f5d59d2ae62",
        databaseURL: "https://rideeazy-2e644-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notificationTitle;
  const notificationOptions = {
    body: payload.body,
    icon: "/assets/logo.png",
    data: payload.data,
  };

  const response = await fetch("/api/saveMessage", {
    method: "POST", 
    body: JSON.stringify({
      ...payload,
    }),
    headers: {"Content-Type": "application/json"}
  });

  const data = await response.json();
  console.log(data.message);

  self.registration.showNotification(notificationTitle,
    notificationOptions);
  
});

self.addEventListener("notificationclick", function (event) {
  const rideId = event.notification.data.rideId;
  event.notification.close();

  event.waitUntil(
    clients.openWindow(`/dashboard?rideId=${rideId}`)
     .catch((err) => {
      console.error("Error opening window:", err);
    }));
})

