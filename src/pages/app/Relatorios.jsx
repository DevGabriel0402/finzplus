import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { listarLancamentosPorMes } from "../../services/lancamentos"; // Reusing existing service
import { hojeISO, mesRefDeDataISO } from "../../utils/datas";
import { formatarDinheiro } from "../../utils/dinheiro";
import { Card, Grid2, Linha } from "../../ui/Base"; // Reusing UI components
import { Label } from "../../ui/Campo";
import { CampoData } from "../../ui/CampoData.jsx";
import styled from "styled-components";

// Styled components for the report list
const ListaRelatorio = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemRelatorio = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BarraProgressoBG = styled.div`
  height: 8px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const BarraProgressoFill = styled.div`
  height: 100%;
  background-color: #ef4444; /* Red for expenses */
  width: ${(props) => props.width || "0%"};
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #374151;
`;

const ValorDestacado = styled.span`
  color: #dc2626;
  font-weight: 700;
`;

const ExemplosTexto = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  font-style: italic;
`;

// Imports updated
import { gerarRelatorioMensalPDF } from "../../relatorios/relatorioMensalPDF";
import { FiDownload, FiFileText, FiX, FiPrinter } from "react-icons/fi";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  height: 90vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
`;

export default function Relatorios() {
    const { usuario } = useAuth();
    const [mesRef, setMesRef] = useState(mesRefDeDataISO(hojeISO()));
    const [lancamentos, setLancamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Preview States
    const [modalAberto, setModalAberto] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    // Load data
    useEffect(() => {
        async function carregar() {
            if (!usuario?.uid) return;
            setCarregando(true);
            try {
                const dados = await listarLancamentosPorMes(usuario.uid, mesRef);
                setLancamentos(dados);
            } catch (e) {
                toast.error("Erro ao carregar dados.");
            } finally {
                setCarregando(false);
            }
        }
        carregar();
    }, [usuario?.uid, mesRef]);

    // Process data for UI (Charts/Lists)
    const relatorioGastos = useMemo(() => {
        const saidas = lancamentos.filter(l => l.tipo === "saida" && l.status === "pago");
        const mapa = new Map();
        let totalGeral = 0;

        saidas.forEach(item => {
            const cat = item.categoria || "Sem Categoria";
            const val = Number(item.valor || 0);
            const desc = item.descricao || "Sem descrição";

            if (!mapa.has(cat)) mapa.set(cat, { valor: 0, itens: [] });
            const entry = mapa.get(cat);
            entry.valor += val;
            entry.itens.push({ desc, val });
            totalGeral += val;
        });

        const lista = Array.from(mapa.entries()).map(([categoria, dados]) => {
            dados.itens.sort((a, b) => b.val - a.val);
            const uniqueExamples = [...new Set(dados.itens.map(i => i.desc))].slice(0, 3);
            return {
                categoria,
                valor: dados.valor,
                exemplosStr: uniqueExamples.join(", "),
                porcentagem: totalGeral > 0 ? (dados.valor / totalGeral) * 100 : 0
            };
        });

        lista.sort((a, b) => b.valor - a.valor);
        return { lista, totalGeral };
    }, [lancamentos]);

    // Handlers
    async function onGerarRelatorio(preview = true) {
        if (!lancamentos.length) return toast.error("Sem dados para gerar relatório.");
        setGerandoPDF(true);
        try {
            if (preview) {
                const url = await gerarRelatorioMensalPDF({
                    mesRef,
                    lancamentos,
                    preview: true
                });
                setPdfUrl(url);
                setModalAberto(true);
            } else {
                await gerarRelatorioMensalPDF({
                    mesRef,
                    lancamentos,
                    preview: false
                });
                toast.success("PDF baixado com sucesso!");
            }
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar PDF.");
        } finally {
            setGerandoPDF(false);
        }
    }

    function fecharModal() {
        setModalAberto(false);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    }

    return (
        <div style={{ display: "grid", gap: 16 }}>
            {modalAberto && (
                <ModalOverlay onClick={fecharModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3 style={{ margin: 0 }}>Visualizar Relatório</h3>
                            <button onClick={fecharModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20 }}>
                                <FiX />
                            </button>
                        </ModalHeader>
                        <div style={{ flex: 1, background: '#e5e7eb', padding: 0 }}>
                            {pdfUrl && (
                                <iframe
                                    id="pdf-iframe"
                                    src={pdfUrl}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="PDF Preview"
                                />
                            )}
                        </div>
                        <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                onClick={fecharModal}
                                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => {
                                    const iframe = document.getElementById('pdf-iframe');
                                    if (iframe) {
                                        iframe.contentWindow.focus();
                                        iframe.contentWindow.print();
                                    }
                                }}
                                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                            >
                                <FiPrinter /> Imprimir
                            </button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            <Linha>
                <h3>Relatórios</h3>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <CampoData
                        type="month"
                        value={mesRef}
                        onChange={(e) => setMesRef(e.target.value)}
                    />
                    <button
                        onClick={() => onGerarRelatorio(true)}
                        disabled={gerandoPDF}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 20px', background: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                            opacity: gerandoPDF ? 0.7 : 1
                        }}
                    >
                        {gerandoPDF ? 'Gerando...' : <><FiFileText /> Visualizar e Imprimir</>}
                    </button>
                </div>
            </Linha>

            <Grid2>
                <Card style={{ gridColumn: "1 / -1" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Onde você mais gasta?</h4>
                    {carregando ? (
                        <p>Carregando...</p>
                    ) : relatorioGastos.lista.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Nenhuma despesa paga registrada neste mês.</p>
                    ) : (
                        <ListaRelatorio>
                            {relatorioGastos.lista.map((item, index) => (
                                <ItemRelatorio key={item.categoria}>
                                    <InfoRow>
                                        <span>{index + 1}. {item.categoria}</span>
                                        <ValorDestacado>{formatarDinheiro(item.valor)}</ValorDestacado>
                                    </InfoRow>
                                    {item.exemplosStr && (
                                        <ExemplosTexto>Ex: {item.exemplosStr}</ExemplosTexto>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#6b7280' }}>
                                        <BarraProgressoBG>
                                            <BarraProgressoFill width={`${item.porcentagem}%`} />
                                        </BarraProgressoBG>
                                        <span style={{ minWidth: 40, textAlign: 'right' }}>{item.porcentagem.toFixed(1)}%</span>
                                    </div>
                                </ItemRelatorio>
                            ))}
                        </ListaRelatorio>
                    )}

                    {!carregando && relatorioGastos.lista.length > 0 && (
                        <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                            <span style={{ marginRight: 8, color: '#6b7280' }}>Total de Saídas Pagas:</span>
                            <strong style={{ fontSize: '1.1rem', color: '#111827' }}>
                                {formatarDinheiro(relatorioGastos.totalGeral)}
                            </strong>
                        </div>
                    )}
                </Card>
            </Grid2>
        </div>
    );
}
