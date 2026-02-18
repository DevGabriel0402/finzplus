import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatarDinheiro } from "../utils/dinheiro";

export default function LinhaGastosPorDia({ dados }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" />
          <YAxis tickFormatter={(value) => formatarDinheiro(value)} />
          <Tooltip formatter={(value) => formatarDinheiro(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="valor"
            name="Gastos"
            strokeWidth={2}
            stroke="currentColor"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
