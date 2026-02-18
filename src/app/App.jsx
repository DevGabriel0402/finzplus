import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Rotas from "./Rotas";
import { Toaster } from "react-hot-toast";
import TemaProvider from "../contexts/TemaContexto";
import AuthProvider from "../contexts/AuthContexto";
import { ConfigProvider } from "../contexts/ConfigContext";
import GlobalStyle from "../styles/GlobalStyle";

import LoadingFinanceiro from "../ui/LoadingFinanceiro";

// ✅ hooks
import { useAuth } from "../hooks/useAuth";
import { useConfig } from "../contexts/ConfigContext";

// ✅ PWA install
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Botao } from "../ui/Botao";
import { FaDownload } from "react-icons/fa";

function AppConteudo() {
  const { carregando: carregandoAuth } = useAuth();
  const { carregando: carregandoConfig } = useConfig();

  // ✅ hook do PWA (botão instalar)
  const { podeInstalar, instalar } = usePWAInstall();

  // ✅ tempo mínimo da splash
  const [tempoMinimoOk, setTempoMinimoOk] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTempoMinimoOk(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const mostrarSplash = !tempoMinimoOk || carregandoAuth || carregandoConfig;

  return (
    <>
      <LoadingFinanceiro
        visivel={mostrarSplash}
        titulo="Gestão de Dívidas"
        subtitulo="Organizando seu dinheiro…"
      />

      {!mostrarSplash && (
        <>
          <GlobalStyle />
          <Toaster position="top-right" />

          {/* ✅ Botão flutuante para instalar o PWA */}
          {podeInstalar && (
            <button
              onClick={instalar}
              title="Instalar aplicativo"
              style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                cursor: "pointer",
                zIndex: 9999,
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <FaDownload />
            </button>
          )}

          <BrowserRouter>
            <Rotas />
          </BrowserRouter>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <ConfigProvider>
          <AppConteudo />
        </ConfigProvider>
      </AuthProvider>
    </TemaProvider>
  );
}
