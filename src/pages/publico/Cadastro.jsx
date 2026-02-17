import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { FiDollarSign, FiEye, FiEyeOff } from "react-icons/fi";
import { cadastrar } from "../../services/auth";
import { criarEstruturaInicial } from "../../services/estruturaInicial";

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
  padding: 2.5rem;
  border-radius: 1rem;
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
    border-color: #16a34a; /* Verde */
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

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) return toast.error("Informe um email.");
    if (!senha) return toast.error("Informe uma senha.");
    if (senha.length < 6) return toast.error("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmarSenha) return toast.error("As senhas não conferem.");

    setCarregando(true);

    try {
      // 1) Cria usuário no Firebase Auth
      const cred = await cadastrar(email.trim(), senha);

      // 2) Cria doc do usuário + subcoleções iniciais (categorias/contas)
      await criarEstruturaInicial(cred.user.uid, cred.user.email);

      toast.success("Conta criada! Bem-vindo ao FinsPlus.");
      nav("/");
    } catch (err) {
      const codigo = err?.code || "";
      if (codigo.includes("auth/email-already-in-use")) {
        toast.error("Esse email já está em uso.");
      } else if (codigo.includes("auth/invalid-email")) {
        toast.error("Email inválido.");
      } else if (codigo.includes("auth/weak-password")) {
        toast.error("Senha fraca.");
      } else {
        toast.error("Falha ao cadastrar.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Container>
      <Card>
        <LogoImage src="/icons/icon-512.png" alt="FinsPlus" />

        <Title>FinsPlus</Title>
        <Subtitle>Crie sua conta gratuitamente</Subtitle>

        <Form onSubmit={handleSubmit}>
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
              <EyeIcon onClick={() => setMostrarSenha(!mostrarSenha)}>
                {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </EyeIcon>
            </InputWrapper>
          </div>

          <div>
            <Label>Confirmar senha</Label>
            <InputWrapper>
              <Input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                required
              />
              <EyeIcon onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>
                {mostrarConfirmar ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </EyeIcon>
            </InputWrapper>
          </div>

          <Button type="submit" disabled={carregando}>
            {carregando ? "Criando..." : "Criar conta"}
          </Button>
        </Form>

        <FooterText>
          Já tem conta? <Link to="/login">Entrar</Link>
        </FooterText>
      </Card>
    </Container>
  );
}
