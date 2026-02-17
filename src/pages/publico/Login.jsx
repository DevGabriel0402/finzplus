import React, { useState } from "react";
import toast from "react-hot-toast";
import { entrar } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { FiDollarSign, FiEye, FiEyeOff } from "react-icons/fi"; // Added Eye icons

// ================= STYLES =================
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff; /* Fundo branco */
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 400px;
  /* Sem sombra ou borda muito forte se o fundo já é branco, 
     mas para destacar o "card" pode-se usar um border sutil ou shadow suave 
     ou simplesmente deixar clean. Vou manter shadow suave para dar destaque. */
  padding: 2.5rem;
  border-radius: 1rem;
  /* Sombra mais suave para não contrastar tanto no branco */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  text-align: center;
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  object-fit: contain;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem; /* Espaço para o ícone */
  background-color: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background-color: white;
    border-color: #16a34a; /* Verde ao focar */
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: #111827;
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: #16a34a; /* Verde */
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;

  a {
    color: #16a34a; /* Verde */
    font-weight: 600;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    try {
      await entrar(email, senha);
      toast.success("Bem-vindo de volta!");
      nav("/");
    } catch (err) {
      toast.error("Falha no login. Verifique suas credenciais.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Container>
      <Card>
        <LogoImage src="/icons/icon-512.png" alt="FinsPlus" />

        <Title>FinsPlus</Title>
        <Subtitle>Entre para gerenciar suas finanças</Subtitle>

        <Form onSubmit={handleSubmit}>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Label>Senha</Label>
            <InputWrapper>
              <Input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <EyeIcon onClick={() => setMostrarSenha(!mostrarSenha)}>
                {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </EyeIcon>
            </InputWrapper>
          </div>

          <Button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
        </Form>

        <FooterText>
          Não tem conta? <Link to="/cadastro">Crie agora</Link>
        </FooterText>
      </Card>
    </Container>
  );
}
