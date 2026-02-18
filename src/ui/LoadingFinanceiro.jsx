import React from "react";
import styled, { keyframes, css } from "styled-components";
import { FiDollarSign } from "react-icons/fi";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 
  70% { transform: scale(1.05); box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;


const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: ${({ theme }) => theme.cores?.fundo || "#0b0f14"};
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.6s ease-in-out, visibility 0.6s ease-in-out;
  
  ${({ $visivel }) =>
    !$visivel &&
    css`
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const LogoBox = styled.div`
  width: 72px;
  height: 72px;
  background: ${({ theme }) => theme.cores?.primaria || "#10B981"};
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 32px;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 10px 30px -10px ${({ theme }) => theme.cores?.primaria || "#10B981"};
`;


export default function LoadingFinanceiro({ visivel = true }) {
  return (
    <Container $visivel={visivel}>
      <Content>
        <LogoBox>
          <FiDollarSign />
        </LogoBox>
      </Content>
    </Container>
  );
}
