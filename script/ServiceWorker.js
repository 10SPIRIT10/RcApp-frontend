// Enregistrement de la PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log(
          "✅ Service Worker enregistré avec succès, scope:",
          reg.scope,
        );
      })
      .catch((err) => {
        console.error("❌ Échec de l’enregistrement du Service Worker :", err);
      });
  });
}
