import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, Grid2, Linha, Container } from "../../ui/Base";
import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";
import { formatarDinheiro } from "../../utils/dinheiro";
import styled from "styled-components";
import { SelectCustomizado } from "../../ui/SelectCustomizado";

// styled component for range inputs
const RangeInput = styled.input`
  width: 100%;
  margin: 10px 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  height: 24px;
  overflow: hidden;
  display: flex;
`;

const ProgressSegment = styled.div`
  height: 100%;
  width: ${(props) => props.percent}%;
  background-color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  transition: width 0.3s ease;
`;

export default function Investimentos() {
  const [regras, setRegras] = useState({ gastos: 70, investimentos: 20, reserva: 10 });
  const [salario, setSalario] = useState("");
  
  const [novoAporte, setNovoAporte] = useState({
    tipo: "Renda Fixa",
    valor: "",
    instituicao: ""
  });
  
  const [historico, setHistorico] = useState([]);

  // Simulador state
  const [simulacao, setSimulacao] = useState({
    valorInicial: "0",
    aporteMensal: "500",
    taxaAnual: "10.5", // default Selic aprox
    anos: "5"
  });
  const [resultadoSimulacao, setResultadoSimulacao] = useState(null);

  // Load from localstorage for persistence
  useEffect(() => {
    const regrasSalvas = localStorage.getItem("finsplus_regras");
    if (regrasSalvas) setRegras(JSON.parse(regrasSalvas));
    
    const historicoSalvo = localStorage.getItem("finsplus_aportes");
    if (historicoSalvo) setHistorico(JSON.parse(historicoSalvo));
  }, []);

  const handleRegraChange = (tipo, valor) => {
    const val = parseInt(valor) || 0;
    setRegras(prev => {
      const novas = { ...prev, [tipo]: val };
      return novas;
    });
  };

  const salvarRegras = () => {
    const total = regras.gastos + regras.investimentos + regras.reserva;
    if (total !== 100) {
      toast.error(`A soma deve ser 100%. Atual: ${total}%`);
      return;
    }
    localStorage.setItem("finsplus_regras", JSON.stringify(regras));
    toast.success("Regras salvas com sucesso!");
  };

  const registrarAporte = (e) => {
    e.preventDefault();
    if (!novoAporte.valor || !novoAporte.instituicao) {
      toast.error("Preencha o valor e a instituição");
      return;
    }
    
    const aporte = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      ...novoAporte,
      valor: parseFloat(novoAporte.valor)
    };
    
    const novoHistorico = [aporte, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("finsplus_aportes", JSON.stringify(novoHistorico));
    toast.success("Aporte registrado!");
    
    setNovoAporte({ ...novoAporte, valor: "", instituicao: "" });
  };

  const calcularSimulacao = () => {
    const p = parseFloat(simulacao.valorInicial) || 0;
    const pmt = parseFloat(simulacao.aporteMensal) || 0;
    const rAnual = parseFloat(simulacao.taxaAnual) || 0;
    const t = parseFloat(simulacao.anos) || 0;

    const rMensal = Math.pow(1 + rAnual / 100, 1 / 12) - 1;
    const n = t * 12;

    let montante = p * Math.pow(1 + rMensal, n);
    
    if (rMensal > 0) {
      montante += pmt * ((Math.pow(1 + rMensal, n) - 1) / rMensal);
    } else {
      montante += pmt * n;
    }

    const totalInvestido = p + (pmt * n);
    const totalJuros = montante - totalInvestido;

    setResultadoSimulacao({
      montante,
      totalInvestido,
      totalJuros
    });
  };

  useEffect(() => {
    calcularSimulacao();
  }, [simulacao]);

  const salarioNum = parseFloat(salario) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Linha>
        <h3>Investimentos & Planejamento</h3>
      </Linha>

      <Grid2 style={{ alignItems: "start" }}>
        <Card style={{ padding: "24px", borderTop: "4px solid #3b82f6" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Estratégia 70/20/10</h4>
          <p style={{ fontSize: "13px", color: "gray", marginBottom: "20px" }}>
            Distribua sua renda de forma inteligente.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <Label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Gastos Mensais</span>
                <strong>{regras.gastos}%</strong>
              </Label>
              <RangeInput 
                type="range" min="0" max="100" 
                value={regras.gastos} 
                onChange={(e) => handleRegraChange('gastos', e.target.value)} 
              />
            </div>
            <div>
              <Label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Investimentos (Futuro)</span>
                <strong>{regras.investimentos}%</strong>
              </Label>
              <RangeInput 
                type="range" min="0" max="100" 
                value={regras.investimentos} 
                onChange={(e) => handleRegraChange('investimentos', e.target.value)} 
              />
            </div>
            <div>
              <Label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Reserva / Livre</span>
                <strong>{regras.reserva}%</strong>
              </Label>
              <RangeInput 
                type="range" min="0" max="100" 
                value={regras.reserva} 
                onChange={(e) => handleRegraChange('reserva', e.target.value)} 
              />
            </div>
            
            <ProgressBar style={{ marginTop: "8px", height: "16px" }}>
              <ProgressSegment percent={regras.gastos} color="#ef4444" style={{ fontSize: "0" }}>{regras.gastos}%</ProgressSegment>
              <ProgressSegment percent={regras.investimentos} color="#3b82f6" style={{ fontSize: "0" }}>{regras.investimentos}%</ProgressSegment>
              <ProgressSegment percent={regras.reserva} color="#10b981" style={{ fontSize: "0" }}>{regras.reserva}%</ProgressSegment>
            </ProgressBar>
            
            <Botao onClick={salvarRegras} style={{ marginTop: "16px", background: "#3b82f6", color: "#fff", padding: "12px" }}>
              Salvar Estratégia
            </Botao>
          </div>
        </Card>

        <Card style={{ padding: "24px", background: "linear-gradient(145deg, #1f2937, #111827)", color: "white", border: "1px solid #374151" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Simulador de Distribuição</h4>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px" }}>
            Insira sua renda líquida para calcular os valores.
          </p>
          
          <div style={{ marginBottom: "24px" }}>
            <Label style={{ color: "#d1d5db" }}>Renda / Salário (R$)</Label>
            <Campo 
              type="number" 
              placeholder="Ex: 5000" 
              value={salario} 
              onChange={(e) => setSalario(e.target.value)} 
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #4b5563", color: "white" }}
            />
          </div>
          
          {salarioNum > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "rgba(239,68,68,0.15)", borderRadius: "10px", borderLeft: "4px solid #ef4444" }}>
                <span style={{ fontSize: "14px", color: "#fca5a5" }}>Gastos Mensais</span>
                <strong style={{ fontSize: "16px", color: "#fca5a5" }}>{formatarDinheiro(salarioNum * (regras.gastos / 100))}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "rgba(59,130,246,0.15)", borderRadius: "10px", borderLeft: "4px solid #3b82f6" }}>
                <span style={{ fontSize: "14px", color: "#93c5fd" }}>Investimentos</span>
                <strong style={{ fontSize: "16px", color: "#93c5fd" }}>{formatarDinheiro(salarioNum * (regras.investimentos / 100))}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "rgba(16,185,129,0.15)", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                <span style={{ fontSize: "14px", color: "#6ee7b7" }}>Reserva / Livre</span>
                <strong style={{ fontSize: "16px", color: "#6ee7b7" }}>{formatarDinheiro(salarioNum * (regras.reserva / 100))}</strong>
              </div>
            </div>
          )}
        </Card>
      </Grid2>

      {/* Simulador de Rendimentos */}
      <Card style={{ padding: "24px", borderTop: "4px solid #8b5cf6" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>Simulador de Rendimentos (Juros Compostos)</h4>
        <p style={{ fontSize: "13px", color: "gray", marginBottom: "20px" }}>
          Simule o poder dos juros compostos em investimentos do Brasil.
        </p>

        <Grid2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <Label>Valor Inicial (R$)</Label>
              <Campo 
                type="number" 
                value={simulacao.valorInicial} 
                onChange={(e) => setSimulacao({...simulacao, valorInicial: e.target.value})} 
              />
            </div>
            <div>
              <Label>Aporte Mensal (R$)</Label>
              <Campo 
                type="number" 
                value={simulacao.aporteMensal} 
                onChange={(e) => setSimulacao({...simulacao, aporteMensal: e.target.value})} 
              />
            </div>
            <div>
              <Label>Tempo (em anos)</Label>
              <Campo 
                type="number" 
                value={simulacao.anos} 
                onChange={(e) => setSimulacao({...simulacao, anos: e.target.value})} 
              />
            </div>
            <div>
              <Label>Perfil de Investimento / Taxa (a.a)</Label>
              <SelectCustomizado 
                value={simulacao.taxaAnual} 
                onChange={(e) => setSimulacao({...simulacao, taxaAnual: e.target.value})}
                options={[
                  { value: "6.17", label: "Poupança (~6.17% a.a)" },
                  { value: "10.5", label: "Tesouro Selic / CDI (~10.5% a.a)" },
                  { value: "11.0", label: "Tesouro Prefixado (~11.0% a.a)" },
                  { value: "12.0", label: "Bolsa / FIIs (Média Conservadora ~12.0% a.a)" }
                ]}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            {resultadoSimulacao ? (
              <div style={{ width: "100%", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <p style={{ margin: "0 0 5px 0", color: "gray", fontSize: "14px" }}>Valor Total Acumulado</p>
                <h2 style={{ margin: "0 0 20px 0", color: "#8b5cf6", fontSize: "32px" }}>
                  {formatarDinheiro(resultadoSimulacao.montante)}
                </h2>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px" }}>
                  <span style={{ color: "gray" }}>Total Investido:</span>
                  <strong style={{ color: "gray" }}>{formatarDinheiro(resultadoSimulacao.totalInvestido)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#10b981" }}>Total em Juros:</span>
                  <strong style={{ color: "#10b981" }}>+ {formatarDinheiro(resultadoSimulacao.totalJuros)}</strong>
                </div>
              </div>
            ) : null}
          </div>
        </Grid2>
      </Card>
      
      <Grid2>
        <Card>
          <h4>Registrar Aporte / Investimento</h4>
          <form onSubmit={registrarAporte} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div>
              <Label>Tipo de Ativo</Label>
              <SelectCustomizado 
                value={novoAporte.tipo} 
                onChange={(e) => setNovoAporte({...novoAporte, tipo: e.target.value})}
                options={[
                  { value: "Tesouro Selic", label: "Tesouro Selic" },
                  { value: "Tesouro IPCA / Prefixado", label: "Tesouro IPCA / Prefixado" },
                  { value: "CDB / LCI / LCA", label: "CDB / LCI / LCA" },
                  { value: "Ações Brasileiras (B3)", label: "Ações Brasileiras (B3)" },
                  { value: "Fundos Imobiliários (FIIs)", label: "Fundos Imobiliários (FIIs)" },
                  { value: "Exterior / BDRs", label: "Exterior / BDRs" },
                  { value: "Criptomoedas", label: "Criptomoedas" }
                ]}
              />
            </div>
            
            <div>
              <Label>Valor do Aporte (R$)</Label>
              <Campo 
                type="number" 
                step="0.01" 
                required 
                value={novoAporte.valor} 
                onChange={(e) => setNovoAporte({...novoAporte, valor: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Instituição Financeira / Corretora</Label>
              <Campo 
                type="text" 
                required 
                placeholder="Ex: NuInvest, Rico, XP, Banco Inter"
                value={novoAporte.instituicao} 
                onChange={(e) => setNovoAporte({...novoAporte, instituicao: e.target.value})} 
              />
            </div>
            
            <Botao type="submit">Salvar Aporte</Botao>
          </form>
        </Card>
        
        <Card>
          <h4>Histórico de Aportes</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px", maxHeight: "300px", overflowY: "auto" }}>
            {historico.length === 0 ? (
              <p style={{ color: "gray", fontSize: "14px" }}>Nenhum aporte registrado ainda.</p>
            ) : (
              historico.map(ap => (
                <div key={ap.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #374151", borderRadius: "8px" }}>
                  <div>
                    <strong style={{ display: "block" }}>{ap.tipo}</strong>
                    <span style={{ fontSize: "12px", color: "gray" }}>{ap.instituicao}</span>
                  </div>
                  <strong style={{ color: "#10b981" }}>{formatarDinheiro(ap.valor)}</strong>
                </div>
              ))
            )}
          </div>
        </Card>
      </Grid2>
    </div>
  );
}
