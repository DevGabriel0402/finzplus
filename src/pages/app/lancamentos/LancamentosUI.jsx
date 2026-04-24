import React from "react";
import { formatarMesAno } from "../../../utils/datas";
import { Linha } from "../../../ui/Base";
import { Label } from "../../../ui/Campo";
import { CampoData } from "../../../ui/CampoData.jsx";

import AbasStatus from "./AbaStatus";
import FormNovoLancamento from "./FormNovoLancamento";
import ListaLancamentos from "./ListaLancamentos";
import ModalEditarLancamento from "./ModalEditarLancamento";

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
  itemEmEdicao,
  onEditar,
  onSalvarEdicao,
  onCancelarEdicao,
}) {
  console.log("RENDER LancamentosUI | qtdAba:", qtdAba, "| totalAba:", totalAba, "| lista length:", lista?.length);

  let tituloAba = "";
  if (aba === "pendente") tituloAba = "Pendente";
  else if (aba === "pago") tituloAba = "Pagos";
  else if (aba === "entrada") tituloAba = "Entradas";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Modal de Edição */}
      {itemEmEdicao && (
        <ModalEditarLancamento
          item={itemEmEdicao}
          onSalvar={onSalvarEdicao}
          onFechar={onCancelarEdicao}
        />
      )}

      <Linha>
        {/* ... header same ... */}
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

      {/* Form apenas para criar */}
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
        isRecorrente={form.isRecorrente}
        setIsRecorrente={form.setIsRecorrente}
        parcelas={form.parcelas}
        setParcelas={form.setParcelas}
        onCriar={onCriar}
      />

      <ListaLancamentos
        titulo={`${tituloAba} (${formatarMesAno(mesRef)})`}
        subtitulo={
          aba === "pendente"
            ? "Marque como pago para mover para “Pagos”."
            : aba === "pago"
              ? "Desmarque para voltar para “Pendente”."
              : "Registro de ingressos."
        }
        carregando={carregando}
        lista={lista}
        onTogglePago={onTogglePago}
        onExcluir={onExcluir}
        // ✅ Edição
        onEditar={onEditar}
      />
    </div>
  );
}
