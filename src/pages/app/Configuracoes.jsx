import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import toast from "react-hot-toast";
import { useConfig } from "../../hooks/useConfig";
import { Card } from "../../ui/Base";
import { Campo, Label } from "../../ui/Campo";
import { Botao } from "../../ui/Botao";
import { ICONES_DISPONIVEIS, obterIcone } from "../../data/iconesPainel";

export default function Configuracoes() {
  const { config, atualizarConfig, carregando } = useConfig();
  const theme = useTheme();

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
  );
}
