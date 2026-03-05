import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../hooks/useConfig";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../ui/Base";
import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";
import { FiUsers } from "react-icons/fi";
import { ICONES_DISPONIVEIS, obterIcone } from "../../data/iconesPainel";

export default function Configuracoes() {
  const { config, atualizarConfig, carregando } = useConfig();
  const { perfil } = useAuth();
  const theme = useTheme();
  const nav = useNavigate();

  const [nomePainel, setNomePainel] = useState(config.nomePainel);
  const [iconePainel, setIconePainel] = useState(config.iconePainel);

  useEffect(() => {
    setNomePainel(config.nomePainel);
    setIconePainel(config.iconePainel);
  }, [config]);

  async function handleSalvar(e) {
    e.preventDefault();

    if (!nomePainel.trim()) {
      return toast.error("Informe um nome válido.");
    }

    try {
      await atualizarConfig({
        nomePainel: nomePainel.trim(),
        iconePainel,
      });

      toast.success("Configurações atualizadas!");
    } catch {
      toast.error("Erro ao salvar.");
    }
  }

  if (carregando) return <div>Carregando...</div>;

  const IconPreview = obterIcone(iconePainel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h3>Configurações do Painel</h3>

        <form onSubmit={handleSalvar} style={{ display: "grid", gap: 16 }}>
          <div>
            <Label>Nome do painel</Label>
            <Campo value={nomePainel} onChange={(e) => setNomePainel(e.target.value)} />
          </div>

          <div>
            <Label>Ícone do painel</Label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
                gap: 10,
                maxHeight: 260,
                overflowY: "auto",
                border: "1px solid #222",
                padding: 10,
                borderRadius: 12,
              }}
            >
              {ICONES_DISPONIVEIS.map((nome) => {
                const Icon = obterIcone(nome);

                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => setIconePainel(nome)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: iconePainel === nome ? "2px solid #16a34a" : "1px solid #333",
                      background: "transparent",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon
                      size={20}
                      color={iconePainel === nome ? "#16a34a" : theme.cores.texto}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <Botao>Salvar</Botao>
        </form>
      </Card>

      {/* Seção Administrativa (Visível apenas para admins) */}
      {perfil?.role === "admin" && (
        <Card>
          <h3>Administração</h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Área restrita a administradores do sistema.
          </p>
          <Botao
            type="button"
            onClick={() => nav("/admin/usuarios")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#1f2937",
              color: "#fff"
            }}
          >
            <FiUsers /> Gerenciar Usuários
          </Botao>
        </Card>
      )}
    </div>
  );
}
