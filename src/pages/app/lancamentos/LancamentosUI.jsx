import React from "react";
import { Linha } from "../../../ui/Base";
import { Label } from "../../../ui/Campo";
import { CampoData } from "../../../ui/CampoData.jsx";

import AbasStatus from "./AbaStatus";
import FormNovoLancamento from "./FormNovoLancamento";
import ListaLancamentos from "./ListaLancamentos";

export default function LancamentosUI({
  mesRef,
  setMesRef,
  aba,
  setAba,

  qtdAba,
  totalAba,

  form,
  onCriar,

  carregando,
  lista,
  onTogglePago,
  onExcluir,
}) {
  const tituloAba = aba === "pendente" ? "A pagar" : "Pagos";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Linha>
        <div style={{ display: "grid", gap: 4 }}>
          <h3 style={{ margin: 0 }}>Lançamentos</h3>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            Estilo To-Do: mova para “Pagos” quando quitar
          </div>
        </div>

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

      <AbasStatus aba={aba} onMudarAba={setAba} qtd={qtdAba} total={totalAba} />

      <FormNovoLancamento
        tipo={form.tipo}
        setTipo={form.setTipo}
        descricao={form.descricao}
        setDescricao={form.setDescricao}
        valor={form.valor}
        setValor={form.setValor}
        data={form.data}
        setData={form.setData}
        categoria={form.categoria}
        setCategoria={form.setCategoria}
        origemDestino={form.origemDestino}
        setOrigemDestino={form.setOrigemDestino}
        conta={form.conta}
        setConta={form.setConta}
        onCriar={onCriar}
      />

      <ListaLancamentos
        titulo={`${tituloAba} (${mesRef})`}
        subtitulo={
          aba === "pendente"
            ? "Marque como pago para mover para “Pagos”."
            : "Desmarque para voltar para “A pagar”."
        }
        carregando={carregando}
        lista={lista}
        onTogglePago={onTogglePago}
        onExcluir={onExcluir}
      />
    </div>
  );
}
