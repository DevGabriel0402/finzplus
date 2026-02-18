import styled from "styled-components";

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 16px;
  border-right: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};

  @media (max-width: 900px) {
    display: none;
  }
`;

export const Marca = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raios.lg};
  background: ${({ theme }) => theme.cores.superficie2};
  box-shadow: ${({ theme }) => theme.sombras.suave};

  strong {
    font-size: 14px;
  }
  span {
    font-size: 12px;
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;

export const Menu = styled.nav`
  margin-top: 14px;
  display: grid;
  gap: 8px;
`;

export const ItemMenu = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ $ativo, theme }) => ($ativo ? theme.cores.hover : "transparent")};
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${({ theme }) => theme.cores.hover};
  }
`;

export const Conteudo = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;

export const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.fundo};
  backdrop-filter: blur(10px);
`;

export const TopbarInner = styled.div`
  max-width: 1150px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .mobile-brand {
    display: none;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 900px) {
    .desktop-titulo {
      display: none;
    }

    .mobile-brand {
      display: flex !important;
    }
  }
`;

export const ConteudoInner = styled.div`
  max-width: 1150px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
`;

export const Titulo = styled.div`
  display: grid;
  gap: 2px;

  h2 {
    margin: 0;
    font-size: 16px;
  }
  p {
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;

export const AcoesTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BotaoIcone = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;

  display: grid;
  place-items: center;

  &:hover {
    background: ${({ theme }) => theme.cores.hover};
  }
`;

export const BotaoIconeMobile = styled(BotaoIcone)`
  display: none;

  @media (max-width: 900px) {
    display: grid;
  }
`;

export const Tabbar = styled.footer`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    position: sticky;
    bottom: 0;
    background: ${({ theme }) => theme.cores.superficie};
    border-top: 1px solid ${({ theme }) => theme.cores.borda};
    padding: 10px 12px;
  }
`;

export const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const Tab = styled.button`
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ $ativo, theme }) => ($ativo ? theme.cores.hover : "transparent")};
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;

  svg {
    width: 22px;
    height: 22px;
  }
`;
