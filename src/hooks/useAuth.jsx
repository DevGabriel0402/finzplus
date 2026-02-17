import { useContext } from "react";
import { AuthContexto } from "../contexts/AuthContexto";

export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
}
