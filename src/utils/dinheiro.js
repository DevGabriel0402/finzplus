export function formatarDinheiro(valor) {
  const n = Number(valor) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

export function formatarMoedaBRLInput(valorTexto) {
  const digits = String(valorTexto ?? "").replace(/\D/g, "");
  const numero = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numero) ? numero : 0);
}

export function parseMoedaBRL(valorTexto) {
  const digits = String(valorTexto ?? "").replace(/\D/g, "");
  const numero = Number(digits) / 100;
  return Number.isFinite(numero) ? numero : 0;
}
