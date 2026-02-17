import React from "react";
import styled, { keyframes, css } from "styled-components";
import { FiDollarSign } from "react-icons/fi";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 
  70% { transform: scale(1.05); box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

const shimmer = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
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

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.cores?.texto || "#fff"};
  letter-spacing: 0.5px;
  opacity: 0.9;
  margin: 0;
`;

const BarContainer = styled.div`
  width: 160px;
  height: 4px;
  background: ${({ theme }) => theme.cores?.borda || "rgba(255,255,255,0.1)"};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 40%;
  background: ${({ theme }) => theme.cores?.primaria || "#10B981"};
  border-radius: 4px;
  animation: ${shimmer} 1.5s infinite linear;
`;

export default function LoadingFinanceiro({ visivel = true }) {
    return (
        <Container $visivel={visivel}>
            <Content>
                <LogoBox>
                    <FiDollarSign />
                </LogoBox>
                <Title>Gestão de Dívidas</Title>
                <BarContainer>
                    <BarFill />
                </BarContainer>
            </Content>
        </Container>
    );
}
