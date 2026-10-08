import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useConfig } from "../../hooks/useConfig";
import { listarLancamentosPorMes } from "../../services/lancamentos";
import { hojeISO, mesRefDeDataISO } from "../../utils/datas";
import { formatarDinheiro } from "../../utils/dinheiro";
import { Card, Grid2, Linha } from "../../ui/Base";
import BarrasEntradasPorOrigem from "../../charts/BarrasEntradasPorOrigem";
import PizzaEntradasVsSaidas from "../../charts/PizzaEntradasVsSaidas";
import BarrasSaidasPorCategoria from "../../charts/BarrasSaidasPorCategoria";
import { Label } from "../../ui/Campo";
import { CampoData } from "../../ui/CampoData.jsx";
import { Botao } from "../../ui/Botao";
import { gerarRelatorioMensalPDF } from "../../relatorios/relatorioMensalPDF";
import { FiTrendingUp, FiTrendingDown, FiClock, FiDollarSign, FiDownload, FiAward, FiStar, FiShield } from "react-icons/fi";
import styled from "styled-components";

// -- Estilos para Gamificação --
const XpBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
`;

const XpBarFill = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  background: linear-gradient(90deg, #8b5cf6, #d946ef);
  transition: width 1s ease-out;
`;

const ConquistaBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${props => props.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)'};
  border: 1px solid ${props => props.active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)'};
  padding: 12px;
  border-radius: 12px;
  opacity: ${props => props.active ? 1 : 0.5};
  filter: ${props => props.active ? 'none' : 'grayscale(100%)'};
  transition: all 0.3s ease;
`;

function agruparSomar(lista, chave) {
  const mapa = new Map();
  for (const item of lista) {
    const nome = String(item?.[chave] || "Outros").trim() || "Outros";
    const atual = mapa.get(nome) || 0;
    mapa.set(nome, atual + (item.valor || 0));
  }
  return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor }));
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const { config } = useConfig();

  const [mesRef, setMesRef] = useState(mesRefDeDataISO(hojeISO()));
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [cotacoes, setCotacoes] = useState({ usd: null, eur: null });
  
  // -- Estado de Gamificação --
  const [gamificacao, setGamificacao] = useState({ nivel: 1, xp: 0, proximoNivelXp: 1000 });

  // Fetch cotações de moedas
  useEffect(() => {
    async function fetchCotacoes() {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL");
        const data = await res.json();
        setCotacoes({
          usd: parseFloat(data.USDBRL.bid),
          eur: parseFloat(data.EURBRL.bid),
        });
      } catch (error) {
        console.error("Erro ao buscar cotações:", error);
      }
    }
    fetchCotacoes();
  }, []);

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

  // Função auxiliar para somar apenas o que "cai" neste mês
  const calcularTotalConsiderandoPagamento = (lista) => {
    return lista.reduce((acc, item) => {
      if (item.status !== "pago") return acc;
      let dataEfetiva = item.pagoEm;
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
  
  const saldoLiquido = totalEntradas - totalSaidas;

  // -- Lógica de Gamificação Dinâmica --
  useEffect(() => {
    // Calcula XP baseado em boas práticas financeiras
    let xpCalculado = 0;
    
    // +10 XP por cada entrada (trabalho/investimento)
    xpCalculado += entradas.length * 10;
    
    // +50 XP se gastou menos do que ganhou
    if (saldoLiquido > 0) xpCalculado += 50;
    
    // +100 XP a cada 1000 reais guardados/sobrando
    if (saldoLiquido > 0) {
      xpCalculado += Math.floor(saldoLiquido / 1000) * 100;
    }
    
    // Calcula nível baseado no XP (1000XP por nível para simplificar)
    const nivelCalculado = Math.floor(xpCalculado / 1000) + 1;
    const proximo = nivelCalculado * 1000;

    setGamificacao({
      nivel: nivelCalculado,
      xp: xpCalculado,
      proximoNivelXp: proximo
    });
  }, [entradas, saldoLiquido]);

  const dadosBarras = useMemo(() => {
    const entradasEfetivas = entradas.filter((item) => {
      if (item.status !== "pago") return false;
      const dataEfetiva = item.pagoEm;
      return dataEfetiva && dataEfetiva.startsWith(mesRef);
    });
    return agruparSomar(entradasEfetivas, "origemDestino");
  }, [entradas, mesRef]);

  const dadosBarrasSaidas = useMemo(() => {
    const saidasEfetivas = saidas.filter((item) => {
      const dataEfetiva = item.status === "pago" ? item.pagoEm : item.data;
      return dataEfetiva && dataEfetiva.startsWith(mesRef);
    });
    return agruparSomar(saidasEfetivas, "origemDestino");
  }, [saidas, mesRef]);

  // Próximos Vencimentos
  const proximosVencimentos = useMemo(() => {
    return saidas
      .filter((item) => item.status !== "pago")
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(0, 5);
  }, [saidas]);

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

  const xpPercent = Math.min((gamificacao.xp % 1000) / 10, 100);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Linha>
        <h3>Dashboard</h3>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Botao onClick={baixarPDF} disabled={gerandoPDF} style={{ display: "flex", gap: "8px", alignItems: "center", background: "#8b5cf6", color: "white" }}>
            <FiDownload />
            {gerandoPDF ? "Gerando..." : "Exportar PDF"}
          </Botao>
          
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Label style={{ margin: 0 }}>Mês</Label>
            <CampoData
              type="month"
              value={mesRef}
              onChange={(e) => setMesRef(e.target.value)}
              style={{ width: 160, paddingRight: 24 }}
            />
          </div>
        </div>
      </Linha>

      {/* Gamificação / Nível Header */}
      <Card style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(139,92,246,0.4)" }}>
              <FiAward size={24} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, color: "#8b5cf6" }}>Investidor Nível {gamificacao.nivel}</h4>
              <span style={{ fontSize: "13px", color: "gray" }}>{gamificacao.xp} XP / {gamificacao.proximoNivelXp} XP para o Nível {gamificacao.nivel + 1}</span>
              <XpBarContainer>
                <XpBarFill percent={xpPercent} />
              </XpBarContainer>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", display: "none" /* Ocultado no mobile via css se necessário */}}>
            <ConquistaBadge active={saldoLiquido > 0}>
              <FiTrendingUp size={20} color={saldoLiquido > 0 ? "#10b981" : "gray"} />
              <span style={{ fontSize: "10px" }}>No Verde</span>
            </ConquistaBadge>
            <ConquistaBadge active={entradas.length > 3}>
              <FiStar size={20} color={entradas.length > 3 ? "#f59e0b" : "gray"} />
              <span style={{ fontSize: "10px" }}>Ativo</span>
            </ConquistaBadge>
            <ConquistaBadge active={saldoLiquido > 1000}>
              <FiShield size={20} color={saldoLiquido > 1000 ? "#8b5cf6" : "gray"} />
              <span style={{ fontSize: "10px" }}>Poupador</span>
            </ConquistaBadge>
          </div>
        </div>
      </Card>

      <Grid2 style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ borderTop: "4px solid #10b981", background: "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 100%)", transition: "transform 0.2s" }} className="hover-scale">
          <div style={{ color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
            <span>Entradas</span>
            <FiTrendingUp color="#10b981" />
          </div>
          <h2 style={{ margin: "6px 0 0", fontSize: "28px" }}>{formatarDinheiro(totalEntradas)}</h2>
        </Card>

        <Card style={{ borderTop: "4px solid #ef4444", background: "linear-gradient(180deg, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0) 100%)", transition: "transform 0.2s" }} className="hover-scale">
          <div style={{ color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
            <span>Saídas</span>
            <FiTrendingDown color="#ef4444" />
          </div>
          <h2 style={{ margin: "6px 0 0", fontSize: "28px" }}>{formatarDinheiro(totalSaidas)}</h2>
        </Card>

        <Card style={{ borderTop: "4px solid #3b82f6", background: "linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 100%)", transition: "transform 0.2s" }} className="hover-scale">
          <div style={{ color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
            <span>Saldo Líquido</span>
            <FiDollarSign color="#3b82f6" />
          </div>
          <h2 style={{ margin: "6px 0 0", fontSize: "28px", color: saldoLiquido >= 0 ? "inherit" : "#ef4444" }}>
            {formatarDinheiro(saldoLiquido)}
          </h2>
        </Card>
      </Grid2>

      <Grid2>
        {/* Painel de Cotações & Ações */}
        <Card style={{ padding: "16px 24px", background: "#111827", border: "1px solid #374151", display: "flex", flexDirection: "column" }}>
          
          {/* Câmbio */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #374151", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🇺🇸</span>
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>Dólar Atual</div>
                <strong style={{ fontSize: "16px", color: "white" }}>{cotacoes.usd ? `R$ ${cotacoes.usd.toFixed(2)}` : "..."}</strong>
              </div>
            </div>
            <div style={{ width: "1px", height: "30px", background: "#374151" }}></div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🇪🇺</span>
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>Euro Atual</div>
                <strong style={{ fontSize: "16px", color: "white" }}>{cotacoes.eur ? `R$ ${cotacoes.eur.toFixed(2)}` : "..."}</strong>
              </div>
            </div>
          </div>

          {/* Melhores Ações (Mock Radar) */}
          <div>
            <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              📈 Radar de Ações (Top 3)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "white" }}>IT</div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "white", display: "block" }}>ITUB4</strong>
                    <span style={{ fontSize: "11px", color: "gray" }}>Itaú Unibanco</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "13px", color: "white", display: "block" }}>R$ 34,50</strong>
                  <span style={{ fontSize: "11px", color: "#10b981" }}>+1.2%</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "white" }}>WE</div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "white", display: "block" }}>WEGE3</strong>
                    <span style={{ fontSize: "11px", color: "gray" }}>WEG S.A.</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "13px", color: "white", display: "block" }}>R$ 38,90</strong>
                  <span style={{ fontSize: "11px", color: "#10b981" }}>+0.8%</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "white" }}>PE</div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "white", display: "block" }}>PETR4</strong>
                    <span style={{ fontSize: "11px", color: "gray" }}>Petrobras</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "13px", color: "white", display: "block" }}>R$ 36,20</strong>
                  <span style={{ fontSize: "11px", color: "#ef4444" }}>-0.4%</span>
                </div>
              </div>

            </div>
          </div>
        </Card>
        
        {/* Painel Próximos Vencimentos */}
        <Card style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <FiClock color="#f59e0b" />
            <h4 style={{ margin: 0 }}>Próximos Vencimentos</h4>
          </div>
          {carregando ? (
            <div style={{ color: "gray", fontSize: "14px" }}>Buscando vencimentos...</div>
          ) : proximosVencimentos.length === 0 ? (
            <div style={{ color: "gray", fontSize: "14px" }}>Nenhuma conta pendente! 🎉</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {proximosVencimentos.map(v => {
                const isAtrasado = new Date(v.data) < new Date(hojeISO());
                return (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "8px", background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
                    <div>
                      <strong style={{ display: "block" }}>{v.origemDestino}</strong>
                      <span style={{ color: isAtrasado ? "#ef4444" : "gray" }}>Vence: {v.data.split('-').reverse().join('/')}</span>
                    </div>
                    <strong style={{ color: "#ef4444" }}>{formatarDinheiro(v.valor)}</strong>
                  </div>
                );
              })}
            </div>
          )}
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
          <h4>Gastos por Categoria</h4>
          {carregando ? (
            <div>Carregando...</div>
          ) : dadosBarrasSaidas.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>Sem saídas no mês.</div>
          ) : (
            <BarrasSaidasPorCategoria dados={dadosBarrasSaidas} />
          )}
        </Card>
      </Grid2>
    </div>
  );
}
