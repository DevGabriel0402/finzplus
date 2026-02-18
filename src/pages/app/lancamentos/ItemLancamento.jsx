import React from "react";
import styled from "styled-components";
import { Linha } from "../../../ui/Base";
import { FiEdit2, FiTrash2, FiCheckCircle, FiCircle } from "react-icons/fi";

const CardItem = styled.div`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 10px;
  transition: all 0.2s ease;
  background: ${({ $tipo, $status, theme }) =>
    $status === "pago"
      ? "rgba(34, 197, 94, 0.15)" // Verde clean para pagos
      : $tipo === "entrada"
        ? "rgba(34, 197, 94, 0.04)"
        : $tipo === "saida"
          ? "rgba(239, 68, 68, 0.04)"
          : theme.cores.superficie};

  &:hover {
    background: ${({ $tipo, $status, theme }) =>
    $status === "pago"
      ? "rgba(34, 197, 94, 0.25)"
      : $tipo === "entrada"
        ? "rgba(34, 197, 94, 0.08)"
        : $tipo === "saida"
          ? "rgba(239, 68, 68, 0.08)"
          : theme.cores.hover};
  }
`;

const Valor = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${({ $tipo, theme }) =>
    $tipo === "entrada" ? theme.cores.sucesso : theme.cores.erro};
  white-space: nowrap;
`;

const LinhaResponsiva = styled(Linha)`
  flex-wrap: nowrap;
  gap: 12px;
  
  @media (max-width: 600px) {
    flex-wrap: wrap;
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

const ActionButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
  color: #9ca3af;

  &:hover {
    background: rgba(0,0,0,0.05);
    color: #374151;
  }

  &.edit:hover { color: #3b82f6; }
  &.pay:hover { color: #16a34a; }
  &.delete:hover { color: #ef4444; }
`;

// Helper format date BR
function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  // dataISO = YYYY-MM-DD
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function ItemLancamento({ item, onTogglePago, onExcluir, onEditar }) {
  const pago = item.status === "pago";

  return (
    <CardItem $tipo={item.tipo} $status={item.status}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

        {/* Esquerda: Info */}
        <div style={{ display: "flex", flexDirection: 'column', gap: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: 'wrap' }}>
            <b style={{
              fontSize: '1rem',
              color: 'currentColor',
            }}>
              {item.descricao}
            </b>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              - {formatarDataBR(item.data)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <Chip>{item.categoria}</Chip>
            <Chip>{item.origemDestino}</Chip>
            <Chip>{item.conta}</Chip>
            {pago && <Chip style={{ borderColor: '#16a34a', color: '#16a34a' }}>Pago</Chip>}
          </div>
        </div>

        {/* Direita: Valor e Ações */}
        <div style={{ display: "flex", flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <Valor $tipo={item.tipo}>
            R$ {item.tipo === "entrada" ? "+" : "-"}{(item.valor || 0).toFixed(2)}
          </Valor>

          <div style={{ display: 'flex', gap: 4 }}>
            {/* EDIT */}
            <ActionButton
              className="edit"
              title="Editar"
              onClick={() => onEditar(item)}
            >
              <FiEdit2 size={16} />
            </ActionButton>

            {/* PAY TOGGLE */}
            <ActionButton
              className="pay"
              title={pago ? "Marcar como pendente" : "Marcar como pago"}
              onClick={() => onTogglePago(item)}
              style={{ color: pago ? '#16a34a' : '#9ca3af' }}
            >
              {pago ? <FiCheckCircle size={18} /> : <FiCircle size={18} />}
            </ActionButton>

            {/* DELETE */}
            <ActionButton
              className="delete"
              title="Excluir"
              onClick={() => onExcluir(item.id)}
            >
              <FiTrash2 size={16} />
            </ActionButton>
          </div>
        </div>

      </div>
    </CardItem>
  );
}
