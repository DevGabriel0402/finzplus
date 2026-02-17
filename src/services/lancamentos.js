import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { hojeISO, mesRefDeDataISO } from "../utils/datas";

function colLancamentos(uid) {
  return collection(db, "usuarios", uid, "lancamentos");
}

/**
 * Cria lançamento (por padrão nasce como "pendente")
 * dados: { tipo, descricao, valor, data, mesRef, categoria, origemDestino, conta }
 */
export async function criarLancamento(uid, dados) {
  const dataVenc = dados.data || hojeISO();
  const mesRef = dados.mesRef || mesRefDeDataISO(dataVenc);

  await addDoc(colLancamentos(uid), {
    tipo: dados.tipo, // "entrada" | "saida"
    descricao: String(dados.descricao || "").trim(),
    valor: Number(dados.valor),
    data: dataVenc, // vencimento (ISO)
    mesRef, // mês do vencimento (YYYY-MM)

    categoria: String(dados.categoria || "").trim(),
    origemDestino: String(dados.origemDestino || "").trim(),
    conta: String(dados.conta || "").trim(),

    // ✅ TO-DO
    status: "pendente", // "pendente" | "pago"
    pagoEm: null, // "YYYY-MM-DD" | null
    mesPagamento: null, // "YYYY-MM" | null

    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Lista por mês do vencimento (mesRef) e opcionalmente por status.
 * status: "pendente" | "pago" | null (se null, traz tudo)
 *
 * ⚠️ Com orderBy + where, pode exigir índice composto.
 * Se você ainda não criou índices, use a versão "semIndice" abaixo.
 */
export async function listarLancamentos(uid, mesRef, status = null) {
  const filtros = [where("mesRef", "==", mesRef)];

  if (status) filtros.push(where("status", "==", status));

  const q = query(colLancamentos(uid), ...filtros, orderBy("data", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * ✅ Versão SEM ÍNDICE: evita erro de índice composto.
 * Busca por mesRef (+ status opcional) e ordena no front.
 */
export async function listarLancamentosSemIndice(uid, mesRef, status = null) {
  const filtros = [where("mesRef", "==", mesRef)];
  if (status) filtros.push(where("status", "==", status));

  const q = query(colLancamentos(uid), ...filtros);

  const snap = await getDocs(q);
  const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // ordena por data desc no front (ISO YYYY-MM-DD ordena perfeito)
  lista.sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));

  return lista;
}

// Mantém compatibilidade com seu código atual:
export async function listarLancamentosPorMes(uid, mesRef) {
  // Troque para listarLancamentosSemIndice se estiver dando erro de índice.
  return listarLancamentos(uid, mesRef, null);
}

/**
 * Atualiza qualquer campo (patch) — sem mandar undefined
 */
export async function atualizarLancamento(uid, id, patch) {
  const ref = doc(db, "usuarios", uid, "lancamentos", id);

  const patchLimpo = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );

  // se vier valor, garante number
  if ("valor" in patchLimpo) {
    patchLimpo.valor = Number(patchLimpo.valor);
  }

  await updateDoc(ref, {
    ...patchLimpo,
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Marca como PAGO (usa data de hoje como padrão)
 * Se quiser passar uma data específica, use marcarComoPagoEm(...)
 */
export async function marcarComoPago(uid, lancamentoId) {
  const pagoEm = hojeISO();
  return marcarComoPagoEm(uid, lancamentoId, pagoEm);
}

/**
 * Marca como pago em uma data específica (ISO)
 */
export async function marcarComoPagoEm(uid, lancamentoId, dataISO) {
  const ref = doc(db, "usuarios", uid, "lancamentos", lancamentoId);

  await updateDoc(ref, {
    status: "pago",
    pagoEm: dataISO,
    mesPagamento: mesRefDeDataISO(dataISO),
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Volta para PENDENTE
 */
export async function marcarComoPendente(uid, lancamentoId) {
  const ref = doc(db, "usuarios", uid, "lancamentos", lancamentoId);

  await updateDoc(ref, {
    status: "pendente",
    pagoEm: null,
    mesPagamento: null,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirLancamento(uid, id) {
  const ref = doc(db, "usuarios", uid, "lancamentos", id);
  await deleteDoc(ref);
}
