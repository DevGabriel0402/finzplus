import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, Grid2, Linha, Container } from "../../ui/Base";
import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";
import { formatarDinheiro } from "../../utils/dinheiro";
import styled from "styled-components";

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

const SelectCampo = styled.select`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
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
      
      <Grid2>
        <Card>
          <h4>Registrar Aporte / Investimento</h4>
          <form onSubmit={registrarAporte} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div>
              <Label>Tipo de Ativo</Label>
              <SelectCampo value={novoAporte.tipo} onChange={(e) => setNovoAporte({...novoAporte, tipo: e.target.value})}>
                <option value="Renda Fixa">Renda Fixa</option>
                <option value="Reserva de Emergência">Reserva de Emergência</option>
                <option value="Ações">Ações</option>
                <option value="FIIs">FIIs</option>
                <option value="Cripto">Cripto</option>
              </SelectCampo>
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
                placeholder="Ex: NuInvest, Rico, XP"
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
