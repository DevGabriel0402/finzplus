// src/relatorios/relatorioMensalPDF.js
import { formatarDinheiro } from "../utils/dinheiro";

// helper: "YYYY-MM" -> "MM/YYYY"
function formatarMesRef(mesRef) {
  const [ano, mes] = String(mesRef || "").split("-");
  if (!ano || !mes) return String(mesRef || "");
  return `${mes}/${ano}`;
}

function ordenarPorDataISO(a, b) {
  const da = String(a?.data || "");
  const db = String(b?.data || "");
  return da.localeCompare(db);
}

export async function gerarRelatorioMensalPDF({
  nomePainel = "Wealth Clean",
  mesRef,
  lancamentos = [],
}) {
  // ✅ dynamic import (reduz bundle inicial e evita dor no build)
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const paginaLargura = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let y = 14;

  const entradas = lancamentos.filter((l) => l.tipo === "entrada");
  const saidas = lancamentos.filter((l) => l.tipo === "saida");

  const totalEntradas = entradas.reduce((a, l) => a + (l.valor || 0), 0);
  const totalSaidas = saidas.reduce((a, l) => a + (l.valor || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const pendentes = lancamentos.filter((l) => (l.status || "pendente") === "pendente");
  const pagos = lancamentos.filter((l) => (l.status || "pendente") === "pago");

  // ====== Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(nomePainel, marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 7;
  doc.text(`Relatório mensal — ${formatarMesRef(mesRef)}`, marginX, y);

  y += 6;
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, marginX, y);

  // linha
  y += 5;
  doc.setDrawColor(220);
  doc.line(marginX, y, paginaLargura - marginX, y);

  // ====== Resumo (tabela pequena)
  y += 6;

  const resumo = [
    ["Entradas", formatarDinheiro(totalEntradas)],
    ["Saídas", formatarDinheiro(totalSaidas)],
    ["Saldo", formatarDinheiro(saldo)],
    ["Lançamentos", String(lancamentos.length)],
    ["Pendentes", String(pendentes.length)],
    ["Pagos", String(pagos.length)],
  ];

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39] }, // preto/cinza escuro
    head: [["Resumo", "Valor"]],
    body: resumo,
    margin: { left: marginX, right: marginX },
  });

  y = doc.lastAutoTable.finalY + 8;

  // ====== Tabela de lançamentos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Lançamentos do mês", marginX, y);
  y += 3;

  const listaOrdenada = [...lancamentos].sort(ordenarPorDataISO);

  const body = listaOrdenada.map((l) => [
    String(l.data || ""),
    l.tipo === "entrada" ? "Entrada" : "Saída",
    String(l.descricao || ""),
    String(l.categoria || ""),
    String(l.origemDestino || ""),
    String(l.conta || ""),
    l.status === "pago" ? "Pago" : "Pendente",
    formatarDinheiro(Number(l.valor || 0)),
  ]);

  autoTable(doc, {
    startY: y + 2,
    theme: "striped",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [17, 24, 39] },
    margin: { left: marginX, right: marginX },
    head: [
      [
        "Data",
        "Tipo",
        "Descrição",
        "Categoria",
        "Origem/Destino",
        "Conta",
        "Status",
        "Valor",
      ],
    ],
    body,
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 16 },
      6: { cellWidth: 18 },
      7: { halign: "right", cellWidth: 22 },
    },
    didDrawPage: () => {
      // rodapé com página
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`,
        paginaLargura - marginX,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  // ====== Salvar
  const nomeArquivo = `relatorio-${mesRef}.pdf`;
  doc.save(nomeArquivo);
}
