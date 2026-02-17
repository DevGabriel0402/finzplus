import styled from "styled-components";

export const Select = styled.select`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  outline: none;

  option {
    color: #0b0b0c;
  }
`;
