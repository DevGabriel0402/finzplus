import React from "react";
import { Card, Linha } from "../../../ui/Base";
import ItemLancamento from "./ItemLancamento";

export default function ListaLancamentos({
  titulo,
  subtitulo,
  carregando,
  lista,
  onTogglePago,
  onExcluir,
}) {
  return (
    <Card>
      <Linha>
        <h4 style={{ margin: 0 }}>{titulo}</h4>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>{subtitulo}</div>
      </Linha>

      {carregando ? (
        <div style={{ paddingTop: 10 }}>Carregando...</div>
      ) : lista.length === 0 ? (
        <div style={{ paddingTop: 10, color: "#9ca3af" }}>Nenhum item nesta aba.</div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {lista.map((item) => (
            <ItemLancamento
              key={item.id}
              item={item}
              onTogglePago={onTogglePago}
              onExcluir={onExcluir}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
