import styled from "styled-components";

export const Campo = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.cores.textoFraco};
  margin-bottom: 6px;
`;
