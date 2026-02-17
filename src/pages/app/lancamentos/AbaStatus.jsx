import React from "react";
import { Card } from "../../../ui/Base";
import { Botao } from "../../../ui/Botao";

export default function AbasStatus({ aba, onMudarAba, qtd, total }) {
  return (
    <Card>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Botao
          type="button"
          onClick={() => onMudarAba("pendente")}
          style={{ opacity: aba === "pendente" ? 1 : 0.75 }}
        >
          A pagar
        </Botao>

        <Botao
          type="button"
          onClick={() => onMudarAba("pago")}
          style={{ opacity: aba === "pago" ? 1 : 0.75 }}
        >
          Pagos
        </Botao>

        <div style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 12 }}>
          {qtd} itens · total {total.toFixed(2)}
        </div>
      </div>
    </Card>
  );
}
