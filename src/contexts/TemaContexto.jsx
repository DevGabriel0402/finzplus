import { createContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { temaDark, temaLight } from "../styles/temas";

export const TemaContexto = createContext(null);

export default function TemaProvider({ children }) {
  const [modo, setModo] = useState(() => {
    const salvo = localStorage.getItem("modoTema");
    return salvo === "light" || salvo === "dark" ? salvo : "dark";
  });

  useEffect(() => {
    localStorage.setItem("modoTema", modo);
  }, [modo]);

  function alternarTema() {
    setModo((m) => (m === "dark" ? "light" : "dark"));
  }

  const temaAtual = modo === "dark" ? temaDark : temaLight;
  const valor = useMemo(() => ({ modo, alternarTema }), [modo]);

  return (
    <TemaContexto.Provider value={valor}>
      <ThemeProvider theme={temaAtual}>{children}</ThemeProvider>
    </TemaContexto.Provider>
  );
}
