import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export const AuthContexto = createContext(null);

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let unsubPerfil = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUsuario(u);

      if (u) {
        // Busca perfil em tempo real para reagir a bloqueios ou promoções
        unsubPerfil = onSnapshot(doc(db, "usuarios", u.uid), (snap) => {
          if (snap.exists()) {
            setPerfil(snap.data());
          } else {
            setPerfil(null);
          }
          setCarregando(false);
        });
      } else {
        setPerfil(null);
        setCarregando(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubPerfil) unsubPerfil();
    };
  }, []);

  const valor = useMemo(() => ({ usuario, perfil, carregando }), [usuario, perfil, carregando]);

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

// ✅ Hook oficial (você pode usar ele ou o src/hooks/useAuth.jsx)
export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
}
