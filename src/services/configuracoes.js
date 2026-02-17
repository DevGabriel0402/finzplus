import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function refConfig(uid) {
  return doc(db, "usuarios", uid, "configuracoes", "painel");
}

export async function buscarConfiguracaoPainel(uid) {
  const snap = await getDoc(refConfig(uid));

  const padrao = {
    nomePainel: "Wealth Clean",
    iconePainel: "FiDollarSign",
  };

  if (!snap.exists()) {
    return padrao;
  }

  return { ...padrao, ...snap.data() };
}

export async function salvarConfiguracaoPainel(uid, dados) {
  await setDoc(
    refConfig(uid),
    {
      ...dados,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true },
  );
}
