import React, { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { buscarConfiguracaoPainel, salvarConfiguracaoPainel } from "../services/configuracoes";

// ✅ exportado para permitir hooks externos (src/hooks/useConfig.jsx)
export const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const { usuario } = useAuth();

  const [config, setConfig] = useState({
    nomePainel: "Wealth Clean",
    iconePainel: "FiDollarSign",
  });

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      // sem usuário → não trava carregando
      if (!usuario?.uid) {
        setCarregando(false);
        return;
      }

      try {
        const cfg = await buscarConfiguracaoPainel(usuario.uid);
        setConfig(cfg);
      } catch {
        setConfig({
          nomePainel: "Wealth Clean",
          iconePainel: "FiDollarSign",
        });
      } finally {
        setCarregando(false);
      }
    }

    setCarregando(true);
    carregar();
  }, [usuario?.uid]);

  async function atualizarConfig(dados) {
    if (!usuario?.uid) return;

    await salvarConfiguracaoPainel(usuario.uid, dados);
    // 🔥 Atualiza instantaneamente no app
    setConfig((prev) => ({ ...prev, ...dados }));
  }

  return (
    <ConfigContext.Provider value={{ config, atualizarConfig, carregando }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = React.useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig deve ser usado dentro de um ConfigProvider");
  }
  return context;
}

