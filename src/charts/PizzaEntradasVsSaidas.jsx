import React, { useMemo } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { formatarDinheiro } from "../utils/dinheiro";

const COR_ENTRADA = "#16a34a"; // verde
const COR_SAIDA = "#dc2626"; // vermelho

export default function PizzaEntradasVsSaidas({ totalEntradas, totalSaidas }) {
  const dados = useMemo(() => {
    const base = [
      { nome: "Entradas", valor: Number(totalEntradas || 0), cor: COR_ENTRADA },
      { nome: "Saídas", valor: Number(totalSaidas || 0), cor: COR_SAIDA },
    ];
    return base.filter((d) => d.valor > 0);
  }, [totalEntradas, totalSaidas]);

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            outerRadius={92}
            isAnimationActive
            animationDuration={650}
            animationEasing="ease-out"
            label={({ value }) => formatarDinheiro(value)}
          >
            {dados.map((entry) => (
              <Cell key={entry.nome} fill={entry.cor} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => formatarDinheiro(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
