import React, { useState } from "react";
import toast from "react-hot-toast";
import { entrar } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const nav = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setCarregando(true);
        try {
            await entrar(email, senha);
            toast.success("Bem-vindo!");
            nav("/");
        } catch (err) {
            toast.error("Falha no login. Confira email/senha.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div>
            <h3>Entrar</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <div>
                    <Label>Email</Label>
                    <Campo value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <Label>Senha</Label>
                    <Campo
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <Botao disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</Botao>
            </form>

            <p style={{ marginTop: 12, color: "#9ca3af" }}>
                Não tem conta? <Link to="/cadastro">Criar agora</Link>
            </p>
        </div>
    );
}
