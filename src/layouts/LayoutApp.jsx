import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiList, FiMoon, FiSun, FiSettings, FiLogOut, FiPieChart } from "react-icons/fi";
import { useTema } from "../hooks/useTema";
import { useConfig } from "../hooks/useConfig";
import { obterIcone } from "../data/iconesPainel";
import { sair } from "../services/auth";

import {
  Shell,
  Sidebar,
  Marca,
  Menu,
  ItemMenu,
  Conteudo,
  Topbar,
  TopbarInner,
  ConteudoInner,
  Titulo,
  AcoesTop,
  BotaoIcone,
  BotaoIconeMobile,
  Tabbar,
  Tabs,
  Tab,
} from "../ui/LayoutShell";

function obterTituloDaRota(rota) {
  if (rota === "/") return "Dashboard";
  if (rota.startsWith("/lancamentos")) return "Lançamentos";
  if (rota.startsWith("/relatorios")) return "Relatórios";
  if (rota.startsWith("/configuracoes")) return "Configurações";
  return "Painel";
}

export default function LayoutApp() {
  const nav = useNavigate();
  const loc = useLocation();
  const { modo, alternarTema } = useTema();
  const { config } = useConfig();

  const rota = loc.pathname;

  const tituloTop = useMemo(() => obterTituloDaRota(rota), [rota]);

  function ir(path) {
    nav(path);
  }

  async function handleLogout() {
    try {
      await sair();
      nav("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <Shell>
      <Sidebar>
        <Marca>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {React.createElement(obterIcone(config.iconePainel), { size: 18 })}
          </div>

          <div>
            <strong>{config.nomePainel}</strong>
            <div>
              <span>Preto & branco</span>
            </div>
          </div>
        </Marca>

        <Menu>
          <ItemMenu $ativo={rota === "/"} onClick={() => ir("/")}>
            <FiHome /> Dashboard
          </ItemMenu>

          <ItemMenu
            $ativo={rota.startsWith("/lancamentos")}
            onClick={() => ir("/lancamentos")}
          >
            <FiList /> Lançamentos
          </ItemMenu>

          <ItemMenu
            $ativo={rota.startsWith("/relatorios")}
            onClick={() => ir("/relatorios")}
          >
            <FiPieChart /> Relatórios
          </ItemMenu>

          <ItemMenu
            $ativo={rota.startsWith("/configuracoes")}
            onClick={() => ir("/configuracoes")}
          >
            <FiSettings /> Configurações
          </ItemMenu>
        </Menu>
      </Sidebar>

      <Conteudo>
        <Topbar>
          <TopbarInner>
            {/* Desktop: Mostra título da rota */}
            <Titulo className="desktop-titulo">
              <h2>{tituloTop}</h2>
              <p>Gerencie entradas, saídas e dívidas por mês</p>
            </Titulo>

            {/* Mobile: Mostra ícone e nome do painel */}
            <div className="mobile-brand" style={{ display: "none" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {React.createElement(obterIcone(config.iconePainel), { size: 16 })}
              </div>
              <strong style={{ fontSize: 14 }}>{config.nomePainel}</strong>
            </div>

            <AcoesTop>
              <BotaoIconeMobile onClick={() => ir("/configuracoes")} title="Configurações">
                <FiSettings />
              </BotaoIconeMobile>
              <BotaoIcone onClick={alternarTema}>
                {modo === "dark" ? <FiSun /> : <FiMoon />}
              </BotaoIcone>
              <BotaoIcone onClick={handleLogout} title="Sair">
                <FiLogOut />
              </BotaoIcone>
            </AcoesTop>
          </TopbarInner>
        </Topbar>

        <ConteudoInner>
          <Outlet />
        </ConteudoInner>

        <Tabbar>
          <Tabs>
            <Tab $ativo={rota === "/"} onClick={() => ir("/")}>
              <FiHome /> Home
            </Tab>

            <Tab
              $ativo={rota.startsWith("/lancamentos")}
              onClick={() => ir("/lancamentos")}
            >
              <FiList /> Lista
            </Tab>

            <Tab
              $ativo={rota.startsWith("/relatorios")}
              onClick={() => ir("/relatorios")}
            >
              <FiPieChart /> Relatórios
            </Tab>


          </Tabs>
        </Tabbar>
      </Conteudo>
    </Shell>
  );
}
