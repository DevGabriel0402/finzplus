import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

// ✅ PWA (vite-plugin-pwa)
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true, // registra logo no início
  onOfflineReady() {
    console.log("[PWA] App pronto para uso offline.");
  },
  onNeedRefresh() {
    console.log("[PWA] Nova versão disponível. Atualize para aplicar.");
    // Se quiser atualizar automaticamente sem perguntar:
    // window.location.reload();
  },
  onRegistered(swRegistration) {
    // opcional: você pode usar swRegistration para forçar update etc.
    // console.log("[PWA] SW registrado:", swRegistration);
  },
  onRegisterError(error) {
    console.log("[PWA] Erro ao registrar SW:", error);
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
