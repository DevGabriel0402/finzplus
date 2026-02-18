// src/relatorios/relatorioMensalPDF.js
import { formatarDinheiro } from "../utils/dinheiro";

// --- Helpers ---
function formatarMesRef(mesRef) {
  const [ano, mes] = String(mesRef || "").split("-");
  if (!ano || !mes) return String(mesRef || "");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
}

// Helper para desenhar setor de gráfico de pizza (aproximado para PDF)
function drawPieSlice(doc, cx, cy, r, startAngle, endAngle, color) {
  const rad = Math.PI / 180;
  const x1 = cx + r * Math.cos(startAngle * rad);
  const y1 = cy + r * Math.sin(startAngle * rad);
  const x2 = cx + r * Math.cos(endAngle * rad);
  const y2 = cy + r * Math.sin(endAngle * rad);

  doc.setFillColor(color[0], color[1], color[2]);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);

  if (Math.abs(endAngle - startAngle) >= 360) {
    doc.circle(cx, cy, r, "FD");
    return;
  }

  doc.lines(
    [[x1 - cx, y1 - cy],
    ...approximateArc(cx, cy, r, startAngle, endAngle),
    [cx - x2, cy - y2]],
    cx, cy, [1, 1], "FD", true
  );
}

// Aproximação de arco para jspdf lines
function approximateArc(cx, cy, r, startAngle, endAngle) {
  const points = [];
  const step = 6;
  for (let a = startAngle + step; a < endAngle; a += step) {
    const rad = Math.PI / 180;
    points.push([
      (cx + r * Math.cos(a * rad)) - (cx + r * Math.cos((a - step) * rad)),
      (cy + r * Math.sin(a * rad)) - (cy + r * Math.sin((a - step) * rad))
    ]);
  }
  const radEnd = Math.PI / 180;
  const radPrev = (Math.floor((endAngle - startAngle) / step) * step + startAngle) * Math.PI / 180;
  points.push([
    (cx + r * Math.cos(endAngle * radEnd)) - (cx + r * Math.cos(radPrev)),
    (cy + r * Math.sin(endAngle * radEnd)) - (cy + r * Math.sin(radPrev))
  ]);
  return points;
}

export async function gerarRelatorioMensalPDF({
  nomePainel = "FinsPlus",
  mesRef,
  lancamentos = [],
  preview = false
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pW = doc.internal.pageSize.getWidth();
  const pH = doc.internal.pageSize.getHeight();

  // Cores Temáticas (Teal/Blue Professional)
  const C_DARK = [17, 24, 39]; // Gray 900
  const C_PRIMARY = [13, 148, 136]; // Teal 600
  const C_ACCENT = [245, 158, 11]; // Amber 500
  const C_BG_SIDE = [243, 244, 246]; // Gray 100
  const C_RED = [239, 68, 68];

  // --- Processamento de Dados ---
  const entradas = lancamentos.filter((l) => l.tipo === "entrada");
  const saidas = lancamentos.filter((l) => l.tipo === "saida");

  const totalEntradas = entradas.reduce((a, l) => a + (l.valor || 0), 0);
  const totalSaidas = saidas.reduce((a, l) => a + (l.valor || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  // Top Categorias (Saídas)
  const catMap = new Map();
  saidas.forEach(l => {
    const c = l.categoria || "Outros";
    catMap.set(c, (catMap.get(c) || 0) + Number(l.valor));
  });
  const topCategories = Array.from(catMap.entries())
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5); // Top 5 para o gráfico

  // Agrupamento por dia (Evolução)
  const diasMap = new Map();
  const daysInMonth = new Date(parseInt(mesRef.split("-")[0]), parseInt(mesRef.split("-")[1]), 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) diasMap.set(d, 0);
  saidas.forEach(l => {
    const d = parseInt(l.data.split("-")[2]);
    diasMap.set(d, (diasMap.get(d) || 0) + Number(l.valor));
  });
  const maxDayVal = Math.max(...Array.from(diasMap.values()));

  // ====================== LAYOUT FRAMEWORK ======================
  // Top Header Area: 0 -> 35mm
  // Sidebar: 0 -> pw*0.35 (bg colored)
  // Main: pw*0.35 -> pw

  // 1. Header
  doc.setFillColor(...C_PRIMARY);
  doc.rect(0, 0, pW, 30, "F");

  // Logo (Simulado com Texto Vectorial para Alta Qualidade)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("FinsPlus", 10, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Financial Intelligence", 10, 22);

  // Título do Relatório (Direita)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório Mensal", pW - 10, 15, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatarMesRef(mesRef)}`, pW - 10, 21, { align: 'right' });

  // 2. Sidebar Background
  const sideW = pW * 0.35;
  doc.setFillColor(...C_BG_SIDE);
  doc.rect(0, 30, sideW, pH - 30, "F");

  // ====================== SIDEBAR CONTENT ======================
  let y = 45;
  const sideX = 10;

  // Create Message Box (Feedback do Saldo)
  const isPositive = saldo >= 0;
  const msgColor = isPositive ? [22, 163, 74] : [220, 38, 38]; // Green or Red
  const msgBg = isPositive ? [240, 253, 244] : [254, 242, 242]; // Light variants

  doc.setFillColor(...msgBg);
  doc.setDrawColor(...msgColor);
  doc.roundedRect(sideX, y - 5, sideW - 20, 25, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setTextColor(...msgColor);
  doc.setFont("helvetica", "bold");
  doc.text(isPositive ? "Excelente!" : "Atenção!", sideX + 5, y + 2);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const msgText = isPositive
    ? "Você fechou o mês no azul. Continue mantendo o controle!"
    : "Seus gastos superaram os ganhos. Revise seu orçamento.";
  const splitMsg = doc.splitTextToSize(msgText, sideW - 30);
  doc.text(splitMsg, sideX + 5, y + 8);

  y += 30;

  // Summary Section
  doc.setTextColor(...C_PRIMARY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", sideX, y);
  y += 8;

  const card = (label, value, color) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(sideX, y, sideW - 20, 18, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(label, sideX + 5, y + 6);

    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    doc.text(value, sideX + 5, y + 14);
    y += 22;
  };

  card("Entradas Totais", formatarDinheiro(totalEntradas), C_PRIMARY);
  card("Saídas Totais", formatarDinheiro(totalSaidas), C_RED);
  card("Saldo Líquido", formatarDinheiro(saldo), saldo >= 0 ? C_PRIMARY : C_RED);

  y += 10;

  // Destaques
  doc.setTextColor(...C_PRIMARY);
  doc.setFontSize(14);
  doc.text("Destaques", sideX, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");

  const destaques = [
    `Maior Gasto: ${formatarDinheiro(saidas.reduce((m, l) => Math.max(m, l.valor), 0))}`,
    `${totalSaidas > 0 ? "Comprometido: " + ((totalSaidas / totalEntradas) * 100).toFixed(0) + "% da renda" : "Sem gastos"}`,
    `${entradas.length} Entradas`,
    `${saidas.length} Saídas`
  ];

  destaques.forEach(d => {
    doc.text(`• ${d}`, sideX, y);
    y += 6;
  });

  // ====================== MAIN CONTENT ======================
  const mainX = sideW + 10;
  y = 45;

  // 1. Donut Chart Section (Categorias)
  doc.setTextColor(...C_DARK);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Distribuição de Gastos", mainX, y);
  y += 10;

  if (topCategories.length > 0) {
    // Config Donut
    const chartCX = mainX + 40;
    const chartCY = y + 35;
    const radius = 28;
    const innerRadius = 16;

    let startAng = 0;

    const palette = [
      [13, 148, 136], // Teal
      [245, 158, 11], // Amber
      [59, 130, 246], // Blue
      [239, 68, 68],  // Red
      [109, 40, 217]  // Purple
    ];

    // Draw Pie Slices
    topCategories.forEach((cat, idx) => {
      const sliceVal = cat.valor;
      const slicePct = sliceVal / totalSaidas;
      const sweepAngle = slicePct * 360;
      const color = palette[idx % palette.length];

      if (slicePct > 0.005) { // < 0.5% ignorar visual
        try {
          drawPieSlice(doc, chartCX, chartCY, radius, startAng, startAng + sweepAngle, color);
        } catch (e) { console.error("Pie error", e); }
      }
      startAng += sweepAngle;
    });

    // Draw Inner Circle (White) -> Creates Donut Effect
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.circle(chartCX, chartCY, innerRadius, "FD");

    // Center Text (Total)
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(8);
    doc.text("Total", chartCX, chartCY - 2, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(formatarDinheiro(totalSaidas), chartCX, chartCY + 4, { align: 'center' });

    // Legend (Right Side)
    let legY = y + 10;
    topCategories.forEach((cat, idx) => {
      const color = palette[idx % palette.length];
      const pct = ((cat.valor / totalSaidas) * 100).toFixed(1);

      doc.setFillColor(...color);
      doc.rect(mainX + 85, legY, 4, 4, "F");

      doc.setTextColor(55, 65, 81);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${cat.nome} (${pct}%)`, mainX + 92, legY + 3);

      legY += 8;
    });

    y += 80;
  } else {
    doc.setFontSize(10);
    doc.text("Sem dados de despesas para gráfico.", mainX, y + 10);
    y += 30;
  }

  // 2. Line Chart Section (Evolução Diária)
  y += 5;
  doc.setTextColor(...C_DARK);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Evolução Diária", mainX, y);
  y += 10;

  if (maxDayVal > 0) {
    const chartH = 40;
    const chartW = pW - mainX - 10;

    // Grid
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= 4; i++) {
      const lineY = y + (i * (chartH / 4));
      doc.line(mainX, lineY, mainX + chartW, lineY);
    }
    doc.setDrawColor(209, 213, 219);
    doc.line(mainX, y + chartH, mainX + chartW, y + chartH);

    const stepX = chartW / (diasMap.size - 1 || 1);
    let points = [];
    const daysSorted = Array.from(diasMap.keys()).sort((a, b) => a - b);

    daysSorted.forEach((dia, idx) => {
      const val = diasMap.get(dia);
      const px = mainX + (idx * stepX);
      const py = y + chartH - ((val / maxDayVal) * chartH);
      points.push({ x: px, y: py, val });
    });

    // Draw Lines - GREEN STANDARD
    const C_GREEN_CHART = [22, 163, 74]; // #16a34a
    doc.setDrawColor(...C_GREEN_CHART);
    doc.setLineWidth(1);
    for (let i = 0; i < points.length - 1; i++) {
      doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }

    // Draw Dots
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...C_GREEN_CHART);
    doc.setLineWidth(1);
    points.forEach(p => {
      if (p.val > 0) {
        doc.circle(p.x, p.y, 1.5, "FD");
      }
    });

    // Labels X
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("1", mainX, y + chartH + 4);
    doc.text("15", mainX + (chartW / 2), y + chartH + 4);
    doc.text(String(daysInMonth), mainX + chartW - 2, y + chartH + 4);

    y += chartH + 15;
  } else {
    doc.setFontSize(10);
    doc.text("Sem movimentação diária.", mainX, y + 10);
    y += 30;
  }

  // Footer Branding
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("Relatório gerado automaticamente por FinsPlus", pW - 10, pH - 10, { align: 'right' });


  // --- Tabela Detalhada (Continuous Flow) ---
  // Calcular Y atual
  // Se houver espaço suficiente (> 40mm), iniciar na mesma página
  // Caso contrário, nova página
  const spaceLeft = pH - y - 20; // 20mm margem bottom
  if (spaceLeft < 40) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  // Header da Seção
  doc.setFillColor(...C_PRIMARY);
  doc.rect(0, y, pW, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhamento de Transações", 10, y + 7);

  y += 15; // Espaço após header

  const listaOrdenada = [...lancamentos].sort((a, b) => a.data.localeCompare(b.data));
  const body = listaOrdenada.map((l) => [
    l.data.split("-").reverse().join("/"),
    l.tipo === "entrada" ? "Entrada" : "Saída",
    l.descricao,
    l.categoria,
    l.conta,
    l.status === "pago" ? "Pago" : "Pendente",
    formatarDinheiro(Number(l.valor)),
  ]);

  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: C_DARK },
    head: [["Data", "Tipo", "Descrição", "Categoria", "Conta", "Status", "Valor"]],
    body: body,
    columnStyles: {
      1: { cellWidth: 20 },
      6: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const rawVal = listaOrdenada[data.row.index].valor;
        const tipo = listaOrdenada[data.row.index].tipo;
        data.cell.styles.textColor = tipo === 'saida' ? C_RED : C_PRIMARY;
      }
    },
    // Adicionar rodapé em cada página nova gerada pelo autoTable
    didDrawPage: (data) => {
      // Apenas para páginas subsequentes geradas pela tabela
      if (data.pageNumber > 1) {
        // Opcional: Adicionar cabeçalho simples ou numeração
      }
    }
  });

  // Salvar/Preview
  if (preview) {
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  } else {
    doc.save(`relatorio-${mesRef}.pdf`);
  }
}
