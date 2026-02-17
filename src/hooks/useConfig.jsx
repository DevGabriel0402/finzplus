import { useContext } from "react";
import { ConfigContext } from "../contexts/ConfigContext";

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig precisa estar dentro de <ConfigProvider>");
  }
  return ctx;
}
