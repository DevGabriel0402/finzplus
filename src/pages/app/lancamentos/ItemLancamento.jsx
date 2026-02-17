import React from "react";
import styled from "styled-components";
import { Linha } from "../../../ui/Base";
import { BotaoPerigo } from "../../../ui/Botao";
import Checkbox from "../../../ui/Checkbox";

const CardItem = styled.div`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 10px;
  transition: all 0.2s ease;
  background: ${({ tipo, theme }) =>
    tipo === "entrada"
      ? "rgba(34, 197, 94, 0.08)"
      : tipo === "saida"
        ? "rgba(239, 68, 68, 0.08)"
        : theme.cores.superficie};

  &:hover {
    background: ${({ tipo, theme }) =>
      tipo === "entrada"
        ? "rgba(34, 197, 94, 0.12)"
        : tipo === "saida"
          ? "rgba(239, 68, 68, 0.12)"
          : theme.cores.hover};
  }
`;

const Valor = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${({ tipo, theme }) =>
    tipo === "entrada" ? theme.cores.sucesso : theme.cores.erro};

  &.valor-mobile {
    display: none;

    @media (max-width: 768px) {
      display: block;
    }
  }

  &.valor-desktop {
    display: block;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const LinhaResponsiva = styled(Linha)`
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
`;

const RodapeItem = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: space-between;
    align-items: center;
  }
`;

const Chip = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.cores.superficie2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.textoFraco};
`;

export default function ItemLancamento({ item, onTogglePago, onExcluir }) {
  const pago = item.status === "pago";

  return (
    <CardItem tipo={item.tipo}>
      <LinhaResponsiva>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Checkbox checked={pago} onChange={() => onTogglePago(item)} tipo={item.tipo} />

          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <b
                style={{
                  textDecoration: pago ? "line-through" : "none",
                  opacity: pago ? 0.7 : 1,
                }}
              >
                {item.descricao}
              </b>

              <span style={{ color: "#9ca3af", fontSize: 12 }}>
                venc: {item.data}
                {pago && item.pagoEm ? ` · pago: ${item.pagoEm}` : ""}
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Chip>{item.categoria}</Chip>
              <Chip>{item.origemDestino}</Chip>
              <Chip>{item.conta}</Chip>
            </div>
          </div>
        </div>

        <Valor tipo={item.tipo} className="valor-desktop">
          <span>R$</span>
          {item.tipo === "entrada" ? "+" : "-"}
          {(item.valor || 0).toFixed(2)}
        </Valor>
      </LinhaResponsiva>

      <RodapeItem>
        <Valor tipo={item.tipo} className="valor-mobile">
          <span>R$</span>
          {item.tipo === "entrada" ? "+" : "-"}
          {(item.valor || 0).toFixed(2)}
        </Valor>

        <BotaoPerigo type="button" onClick={() => onExcluir(item.id)}>
          Excluir
        </BotaoPerigo>
      </RodapeItem>
    </CardItem>
  );
}
