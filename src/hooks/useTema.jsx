import { useContext } from "react";
import { TemaContexto } from "../contexts/TemaContexto";

export function useTema() {
  const ctx = useContext(TemaContexto);
  if (!ctx) throw new Error("useTema deve ser usado dentro do TemaProvider");
  return ctx;
}
