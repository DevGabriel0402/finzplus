import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Card, Grid2, Linha } from "../../ui/Base";
import { Campo, Label } from "../../ui/Campo";
import { Botao, BotaoPerigo } from "../../ui/Botao";
import { formatarDinheiro } from "../../utils/dinheiro";
import styled from "styled-components";

// --- Styled Components ---
const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  height: 20px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => Math.min(props.percent, 100)}%;
  background-color: ${(props) => (props.percent >= 100 ? '#10b981' : '#3b82f6')};
  transition: width 0.4s ease;
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

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px dashed ${({ theme }) => theme.cores.borda};
`;

// --- Lista simulada de Bancos (@edusites/brasil-bancos mockup) ---
const BANCOS_BRASIL = [
  { codigo: "260", nome: "Nu Pagamentos S.A. (Nubank)" },
  { codigo: "077", nome: "Banco Inter S.A." },
  { codigo: "336", nome: "Banco C6 S.A." },
  { codigo: "001", nome: "Banco do Brasil S.A." },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "033", nome: "Banco Santander (Brasil) S.A." },
  { codigo: "341", nome: "Itaú Unibanco S.A." },
  { codigo: "237", nome: "Banco Bradesco S.A." },
  { codigo: "114", nome: "Central Cooperativa de Crédito no Estado do Espírito Santo - CECOOP" },
];

export default function Metas() {
  const [metas, setMetas] = useState([]);
  
  // State form Nova Meta
  const [novaMeta, setNovaMeta] = useState({ titulo: "", valorAlvo: "", codigoBanco: "260" });
  
  // State form Aporte
  const [metaSelecionada, setMetaSelecionada] = useState("");
  const [novoAporte, setNovoAporte] = useState({ valor: "", comprovanteBase64: null });
  const fileInputRef = useRef(null);

  // Load from LocalStorage
  useEffect(() => {
    const metasSalvas = localStorage.getItem("finsplus_metas");
    if (metasSalvas) setMetas(JSON.parse(metasSalvas));
  }, []);

  const salvarMetasLocal = (novasMetas) => {
    setMetas(novasMetas);
    localStorage.setItem("finsplus_metas", JSON.stringify(novasMetas));
  };

  const handleCriarMeta = (e) => {
    e.preventDefault();
    if (!novaMeta.titulo || !novaMeta.valorAlvo) {
      toast.error("Preencha título e valor alvo da meta!");
      return;
    }

    const banco = BANCOS_BRASIL.find(b => b.codigo === novaMeta.codigoBanco) || BANCOS_BRASIL[0];

    const novaMetaObj = {
      id: `meta-${Date.now()}`,
      titulo: novaMeta.titulo,
      valorAlvo: parseFloat(novaMeta.valorAlvo),
      valorAtual: 0,
      bancoDestino: banco,
      historicoAportes: []
    };

    salvarMetasLocal([...metas, novaMetaObj]);
    toast.success("Meta criada com sucesso!");
    setNovaMeta({ titulo: "", valorAlvo: "", codigoBanco: "260" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      fileInputRef.current.value = "";
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo deve ser uma imagem (JPG, PNG)");
      fileInputRef.current.value = "";
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setNovoAporte(prev => ({ ...prev, comprovanteBase64: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdicionarAporte = (e) => {
    e.preventDefault();
    if (!metaSelecionada || !novoAporte.valor) {
      toast.error("Selecione a meta e insira o valor!");
      return;
    }

    const valorAporteNum = parseFloat(novoAporte.valor);

    const novasMetas = metas.map(meta => {
      if (meta.id === metaSelecionada) {
        const aporteObj = {
          id: `ap-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          valor: valorAporteNum,
          comprovanteBase64: novoAporte.comprovanteBase64
        };
        return {
          ...meta,
          valorAtual: meta.valorAtual + valorAporteNum,
          historicoAportes: [...meta.historicoAportes, aporteObj]
        };
      }
      return meta;
    });

    salvarMetasLocal(novasMetas);
    toast.success("Aporte registrado com sucesso!");
    
    // reset
    setMetaSelecionada("");
    setNovoAporte({ valor: "", comprovanteBase64: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Linha>
        <h3>Metas & Caixinhas</h3>
      </Linha>

      <Grid2 style={{ alignItems: "start" }}>
        {/* Formulário: Nova Meta */}
        <Card style={{ padding: "24px", borderTop: "4px solid #10b981", background: "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 100%)" }}>
          <h4 style={{ margin: "0 0 16px 0" }}>🎯 Criar Nova Meta</h4>
          <form onSubmit={handleCriarMeta} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Label>Nome da Meta (Ex: Reserva de Emergência)</Label>
              <Campo 
                type="text" 
                required
                value={novaMeta.titulo} 
                onChange={(e) => setNovaMeta({...novaMeta, titulo: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Valor Alvo (Goal R$)</Label>
              <Campo 
                type="number" 
                step="0.01" 
                required
                value={novaMeta.valorAlvo} 
                onChange={(e) => setNovaMeta({...novaMeta, valorAlvo: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Banco/Corretora de Destino</Label>
              <SelectCampo 
                value={novaMeta.codigoBanco} 
                onChange={(e) => setNovaMeta({...novaMeta, codigoBanco: e.target.value})}
              >
                {BANCOS_BRASIL.map(banco => (
                  <option key={banco.codigo} value={banco.codigo}>
                    {banco.codigo} - {banco.nome}
                  </option>
                ))}
              </SelectCampo>
            </div>
            
            <Botao type="submit">Adicionar Meta</Botao>
          </form>
        </Card>

        {/* Formulário: Novo Aporte */}
        <Card style={{ padding: "24px", borderTop: "4px solid #3b82f6", background: "linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 100%)" }}>
          <h4 style={{ margin: "0 0 16px 0" }}>💰 Registrar Aporte</h4>
          <form onSubmit={handleAdicionarAporte} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Label>Selecione a Meta</Label>
              <SelectCampo 
                required
                value={metaSelecionada} 
                onChange={(e) => setMetaSelecionada(e.target.value)}
              >
                <option value="">-- Escolha uma Meta --</option>
                {metas.map(meta => (
                  <option key={meta.id} value={meta.id}>
                    {meta.titulo} ({formatarDinheiro(meta.valorAtual)} / {formatarDinheiro(meta.valorAlvo)})
                  </option>
                ))}
              </SelectCampo>
            </div>
            
            <div>
              <Label>Valor a Guardar (R$)</Label>
              <Campo 
                type="number" 
                step="0.01" 
                required
                value={novoAporte.valor} 
                onChange={(e) => setNovoAporte({...novoAporte, valor: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Comprovante (Imagem Max: 2MB)</Label>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                style={{ width: "100%", color: "gray", padding: "10px 0" }}
              />
              {novoAporte.comprovanteBase64 && (
                <div>
                  <Label style={{ marginTop: "10px" }}>Preview do Comprovante</Label>
                  <ImagePreview src={novoAporte.comprovanteBase64} alt="Preview" />
                </div>
              )}
            </div>
            
            <Botao type="submit" disabled={!metaSelecionada || metas.length === 0}>Salvar Aporte</Botao>
          </form>
        </Card>
      </Grid2>

      <h4 style={{ marginTop: "24px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #374151" }}>Suas Caixinhas ativas</h4>
      {metas.length === 0 ? (
        <p style={{ color: "gray" }}>Você ainda não criou nenhuma meta.</p>
      ) : (
        <Grid2>
          {metas.map((meta) => {
            const percentual = meta.valorAlvo > 0 ? (meta.valorAtual / meta.valorAlvo) * 100 : 0;
            return (
              <Card key={meta.id} style={{ border: percentual >= 100 ? "1px solid #10b981" : "1px solid #374151" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0" }}>{meta.titulo}</h4>
                    <p style={{ margin: "0", fontSize: "12px", color: "gray" }}>
                      Destino: {meta.bancoDestino?.nome}
                    </p>
                  </div>
                  <strong style={{ color: percentual >= 100 ? "#10b981" : "#3b82f6" }}>
                    {percentual.toFixed(1)}%
                  </strong>
                </div>
                
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span>{formatarDinheiro(meta.valorAtual)} guardados</span>
                    <span>Alvo: {formatarDinheiro(meta.valorAlvo)}</span>
                  </div>
                  <ProgressBarContainer>
                    <ProgressFill percent={percentual} />
                  </ProgressBarContainer>
                </div>
                
                {meta.historicoAportes && meta.historicoAportes.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <h5 style={{ margin: "0 0 10px 0" }}>Últimos Aportes</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                      {meta.historicoAportes.slice().reverse().map(ap => (
                        <div key={ap.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderBottom: "1px solid #374151", paddingBottom: "4px" }}>
                          <div>
                            <span style={{ color: "gray", marginRight: "8px" }}>{ap.data}</span>
                            <strong>{formatarDinheiro(ap.valor)}</strong>
                          </div>
                          {ap.comprovanteBase64 && (
                            <a href={ap.comprovanteBase64} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>Ver Anexo</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </Grid2>
      )}
    </div>
  );
}
