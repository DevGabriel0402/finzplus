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

export default function Relatorios() {
    const { usuario } = useAuth();

    const [mesRef, setMesRef] = useState(mesRefDeDataISO(hojeISO()));
    const [lancamentos, setLancamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Load data same as Dashboard
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

    // Process data: Filter Expenses -> Group by Category -> Sort Desc
    const relatorioGastos = useMemo(() => {
        // 1. Filter only expenses (saida) AND paid (pago) within the current month (Cash Basis)
        const saidas = lancamentos.filter(l => {
            // Must be an expense
            if (l.tipo !== "saida") return false;

            // Must be paid
            if (l.status !== "pago") return false;

            // Must have been paid in the selected month (Regime de Caixa)
            // If pagoEm is missing, we skip it to be safe, or assume data (due date)? 
            // User asked for "only what was paid", implying strict cash basis.
            if (!l.pagoEm || !l.pagoEm.startsWith(mesRef)) return false;

            return true;
        });

        // 2. Group by category
        const mapa = new Map();
        let totalGeral = 0;

        saidas.forEach(item => {
            const cat = item.categoria || "Sem Categoria";
            const val = Number(item.valor || 0);
            const desc = item.descricao || "Sem descrição";

            if (!mapa.has(cat)) {
                mapa.set(cat, { valor: 0, itens: [] });
            }
            const entry = mapa.get(cat);
            entry.valor += val;
            entry.itens.push({ desc, val });
            totalGeral += val;
        });

        // 3. Convert to array and sort
        const lista = Array.from(mapa.entries()).map(([categoria, dados]) => {
            // Sort items by value desc to pick the most relevant examples
            dados.itens.sort((a, b) => b.val - a.val);

            // Unique descriptions (up to 3)
            const uniqueExamples = new Set();
            const examplesList = [];

            for (const item of dados.itens) {
                if (!uniqueExamples.has(item.desc)) {
                    uniqueExamples.add(item.desc);
                    examplesList.push(item.desc);
                }
                if (examplesList.length >= 3) break;
            }

            return {
                categoria,
                valor: dados.valor,
                exemplosStr: examplesList.join(", "),
                porcentagem: totalGeral > 0 ? (dados.valor / totalGeral) * 100 : 0
            };
        });

        // Sort categories: Biggest expenses first
        lista.sort((a, b) => b.valor - a.valor);

        return { lista, totalGeral };
    }, [lancamentos, mesRef]);

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <Linha>
                <h3>Relatório de Gastos</h3>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Label style={{ margin: 0 }}>Mês</Label>
                    <CampoData
                        type="month"
                        value={mesRef}
                        onChange={(e) => setMesRef(e.target.value)}
                        style={{ paddingRight: 24 }}
                    />
                </div>
            </Linha>

            <Grid2>
                <Card style={{ gridColumn: "1 / -1" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Onde você mais gasta?</h4>

                    {carregando ? (
                        <p>Carregando...</p>
                    ) : relatorioGastos.lista.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Nenhuma despesa registrada neste mês.</p>
                    ) : (
                        <ListaRelatorio>
                            {relatorioGastos.lista.map((item, index) => (
                                <ItemRelatorio key={item.categoria}>
                                    <InfoRow>
                                        <span>{index + 1}. {item.categoria}</span>
                                        <ValorDestacado>{formatarDinheiro(item.valor)}</ValorDestacado>
                                    </InfoRow>

                                    {item.exemplosStr && (
                                        <ExemplosTexto>
                                            Ex: {item.exemplosStr}
                                        </ExemplosTexto>
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
                            <span style={{ marginRight: 8, color: '#6b7280' }}>Total de Saídas:</span>
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
