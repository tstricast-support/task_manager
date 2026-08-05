self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "New task", body: "" };
  event.waitUntil(
    self.registration.showNotification(data.title || "Task Manager", {
      body: data.body || "You have a new task.",
      icon: "/logo.png",
      badge: "/logo.png",
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});