import styled from "styled-components";

export const Botao = styled.button`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.botao};
  color: ${({ theme }) => theme.cores.botaoTexto};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BotaoPerigo = styled(Botao)`
  background: ${({ theme }) => theme.cores.perigo};
  color: ${({ theme }) => theme.cores.botaoTexto};
  border-color: ${({ theme }) => theme.cores.perigo};
`;
