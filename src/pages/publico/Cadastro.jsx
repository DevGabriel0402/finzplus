import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

import { cadastrar } from "../../services/auth";
import { criarEstruturaInicial } from "../../services/estruturaInicial";

import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";

export default function Cadastro() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
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

            toast.success("Conta criada e estrutura inicial configurada!");
            nav("/");
        } catch (err) {
            // erros comuns: email já em uso, senha fraca, etc.
            const codigo = err?.code || "";

            if (codigo.includes("auth/email-already-in-use")) {
                toast.error("Esse email já está em uso.");
            } else if (codigo.includes("auth/invalid-email")) {
                toast.error("Email inválido.");
            } else if (codigo.includes("auth/weak-password")) {
                toast.error("Senha fraca. Use uma senha mais forte.");
            } else {
                toast.error("Falha ao cadastrar. Tente novamente.");
            }
            // opcional: console.log(err)
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div>
            <h3>Cadastrar</h3>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <div>
                    <Label>Email</Label>
                    <Campo
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@email.com"
                        autoComplete="email"
                    />
                </div>

                <div>
                    <Label>Senha</Label>
                    <Campo
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="mínimo 6 caracteres"
                        autoComplete="new-password"
                    />
                </div>

                <div>
                    <Label>Confirmar senha</Label>
                    <Campo
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="repita a senha"
                        autoComplete="new-password"
                    />
                </div>

                <Botao disabled={carregando}>
                    {carregando ? "Criando..." : "Criar conta"}
                </Botao>
            </form>

            <p style={{ marginTop: 12, color: "#9ca3af" }}>
                Já tem conta? <Link to="/login">Entrar</Link>
            </p>
        </div>
    );
}
