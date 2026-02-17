import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatarDinheiro } from "../utils/dinheiro";

export default function BarrasEntradasPorOrigem({ dados }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis tickFormatter={(value) => formatarDinheiro(value)} />
          <Tooltip formatter={(value) => formatarDinheiro(value)} />
          <Legend />
          <Bar dataKey="valor" name="Valor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
