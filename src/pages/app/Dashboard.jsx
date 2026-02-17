import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useConfig } from "../../hooks/useConfig";
import { listarLancamentosPorMes } from "../../services/lancamentos";
import { hojeISO, mesRefDeDataISO } from "../../utils/datas";
import { formatarDinheiro } from "../../utils/dinheiro";
import { Card, Grid2, Linha } from "../../ui/Base";
import { Botao } from "../../ui/Botao";
import BarrasEntradasPorOrigem from "../../charts/BarrasEntradasPorOrigem";
import PizzaEntradasVsSaidas from "../../charts/PizzaEntradasVsSaidas";
import LinhaGastosPorDia from "../../charts/LinhaGastosPorDia";
import { Label } from "../../ui/Campo";
import { CampoData } from "../../ui/CampoData.jsx";
import { gerarRelatorioMensalPDF } from "../../relatorios/relatorioMensalPDF";

function agruparSomar(lista, chave) {
  const mapa = new Map();
  for (const item of lista) {
    const nome = String(item?.[chave] || "Outros").trim() || "Outros";
    const atual = mapa.get(nome) || 0;
    mapa.set(nome, atual + (item.valor || 0));
  }
  return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor }));
}

function montarDiasDoMes(mesRef) {
  const [anoStr, mesStr] = String(mesRef || "").split("-");
  const ano = Number(anoStr);
  const mes = Number(mesStr); // 1..12
  if (!ano || !mes) return [];
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const dias = [];
  for (let d = 1; d <= ultimoDia; d++) dias.push(String(d).padStart(2, "0"));
  return dias;
}

function agruparSaidasPorDia(saidas, mesRef) {
  const dias = montarDiasDoMes(mesRef);
  const mapa = new Map(dias.map((dia) => [dia, 0]));

  for (const s of saidas) {
    // Lógica para definir a 'data efetiva' do gasto no gráfico:
    // Se não for pago, ignora (saldo real / caixa).
    if (s.status !== "pago") continue;

    let dataEfetiva = s.pagoEm;

    if (!dataEfetiva || typeof dataEfetiva !== "string") continue;

    // Opcional: só soma no gráfico se a data efetiva for dentro do mês atual do dashboard.
    // Se o user pagou antecipado (mês anterior) ou atrasado (mês seguinte), 
    // e estamos visualizando este mêsRef, teoricamente não apareceria neste dias[].
    if (!dataEfetiva.startsWith(mesRef)) continue;

    const dia = dataEfetiva.slice(8, 10);
    mapa.set(dia, (mapa.get(dia) || 0) + (s.valor || 0));
  }

  return dias.map((dia) => ({ dia, valor: mapa.get(dia) || 0 }));
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const { config } = useConfig();

  const [mesRef, setMesRef] = useState(mesRefDeDataISO(hojeISO()));
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  async function carregar() {
    if (!usuario?.uid) return;
    setCarregando(true);

    try {
      const dados = await listarLancamentosPorMes(usuario.uid, mesRef);
      setLancamentos(dados);
    } catch (e) {
      console.log("ERRO AO CARREGAR DASHBOARD:", e?.code, e?.message, e);
      toast.error("Erro ao carregar dashboard.", { id: "erro-carregar-dashboard" });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.uid, mesRef]);

  const entradas = useMemo(() => lancamentos.filter((l) => l.tipo === "entrada"), [lancamentos]);
  const saidas = useMemo(() => lancamentos.filter((l) => l.tipo === "saida"), [lancamentos]);

  // Função auxiliar para somar apenas o que "cai" neste mês (Regime de Caixa adaptado)
  const calcularTotalConsiderandoPagamento = (lista) => {
    return lista.reduce((acc, item) => {
      // Se não for pago, ignora (saldo real / caixa).
      if (item.status !== "pago") return acc;

      let dataEfetiva = item.pagoEm;

      // Se a data efetiva pertencer ao mês atual (mesRef), soma.
      if (dataEfetiva && dataEfetiva.startsWith(mesRef)) {
        return acc + (item.valor || 0);
      }
      return acc;
    }, 0);
  };

  const totalEntradas = useMemo(
    () => calcularTotalConsiderandoPagamento(entradas),
    [entradas, mesRef],
  );

  const totalSaidas = useMemo(
    () => calcularTotalConsiderandoPagamento(saidas),
    [saidas, mesRef],
  );

  const dadosBarras = useMemo(() => {
    // Agora o gráfico de "Entradas por origem" também só mostra o que foi pago NO MÊS.
    const entradasEfetivas = entradas.filter((item) => {
      if (item.status !== "pago") return false;
      const dataEfetiva = item.pagoEm;
      return dataEfetiva && dataEfetiva.startsWith(mesRef);
    });
    return agruparSomar(entradasEfetivas, "origemDestino");
  }, [entradas, mesRef]);

  const dadosLinhaGastosPorDia = useMemo(() => agruparSaidasPorDia(saidas, mesRef), [saidas, mesRef]);

  async function baixarPDF() {
    try {
      setGerandoPDF(true);
      await gerarRelatorioMensalPDF({
        nomePainel: config?.nomePainel || "Wealth Clean",
        mesRef,
        lancamentos,
      });
      toast.success("PDF gerado!");
    } catch (e) {
      console.log("ERRO AO GERAR PDF:", e);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGerandoPDF(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Linha>
        <h3>Dashboard</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Label style={{ margin: 0 }}>Mês</Label>

          <CampoData
            type="month"
            value={mesRef}
            onChange={(e) => setMesRef(e.target.value)}
            style={{ width: 200, paddingRight: 24 }}
          />

          <Botao type="button" onClick={baixarPDF} disabled={gerandoPDF || carregando}>
            {gerandoPDF ? "Gerando PDF..." : "Baixar PDF"}
          </Botao>
        </div>
      </Linha>

      <Grid2>
        <Card>
          <div style={{ color: "#9ca3af" }}>Saldo</div>
          <h2 style={{ margin: "6px 0 0" }}>
            {formatarDinheiro(totalEntradas - totalSaidas)}
          </h2>
        </Card>

        <Card>
          <div style={{ color: "#9ca3af" }}>Lançamentos</div>
          <h2 style={{ margin: "6px 0 0" }}>{lancamentos.length}</h2>
        </Card>

        <Card bg="rgba(22,163,74,0.12)">
          <div style={{ color: "#9ca3af" }}>Entradas</div>
          <h2 style={{ margin: "6px 0 0" }}>{formatarDinheiro(totalEntradas)}</h2>
        </Card>

        <Card bg="rgba(220,38,38,0.12)">
          <div style={{ color: "#9ca3af" }}>Saídas</div>
          <h2 style={{ margin: "6px 0 0" }}>{formatarDinheiro(totalSaidas)}</h2>
        </Card>
      </Grid2>

      <Grid2>
        <Card>
          <h4>Entradas vs Saídas</h4>
          {carregando ? (
            <div>Carregando...</div>
          ) : totalEntradas === 0 && totalSaidas === 0 ? (
            <div style={{ color: "#9ca3af" }}>Sem dados no mês.</div>
          ) : (
            <PizzaEntradasVsSaidas totalEntradas={totalEntradas} totalSaidas={totalSaidas} />
          )}
        </Card>

        <Card>
          <h4>De onde veio (Entradas por origem)</h4>
          {carregando ? (
            <div>Carregando...</div>
          ) : dadosBarras.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>Sem entradas no mês.</div>
          ) : (
            <BarrasEntradasPorOrigem dados={dadosBarras} />
          )}
        </Card>

        <Card style={{ gridColumn: "1 / -1" }}>
          <h4>Gastos por dia</h4>
          {carregando ? (
            <div>Carregando...</div>
          ) : saidas.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>Sem saídas no mês.</div>
          ) : (
            <LinhaGastosPorDia dados={dadosLinhaGastosPorDia} />
          )}
        </Card>
      </Grid2>
    </div>
  );
}
