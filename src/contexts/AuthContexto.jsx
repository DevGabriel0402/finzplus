import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export const AuthContexto = createContext(null);

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  const valor = useMemo(() => ({ usuario, carregando }), [usuario, carregando]);

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

// ✅ Hook oficial (você pode usar ele ou o src/hooks/useAuth.jsx)
export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
}
