export function hojeISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function mesRefDeDataISO(dataISO) {
    return dataISO.slice(0, 7); // "YYYY-MM"
}
export function formatarMesAno(mesRef) {
    if (!mesRef) return "";
    const [ano, mes] = mesRef.split("-");
    const meses = [
        "jan", "fev", "mar", "abr", "mai", "jun",
        "jul", "ago", "set", "out", "nov", "dez"
    ];
    const mesIndex = parseInt(mes) - 1;
    return `${meses[mesIndex]}/${ano}`;
}
export function adicionarMeses(dataISO, meses) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  // O construtor Date(ano, mes - 1 + meses, dia) cuida de virar o ano se necessário
  const d = new Date(ano, (mes - 1) + meses, dia);
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
