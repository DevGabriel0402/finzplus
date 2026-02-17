import { useEffect, useState } from "react";

export function usePWAInstall() {
    const [podeInstalar, setPodeInstalar] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        function handleBeforeInstallPrompt(e) {
            e.preventDefault();
            setDeferredPrompt(e);
            setPodeInstalar(true);
        }

        function handleAppInstalled() {
            setPodeInstalar(false);
            setDeferredPrompt(null);
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    async function instalar() {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;

        setPodeInstalar(false);
        setDeferredPrompt(null);
    }

    return { podeInstalar, instalar };
}
