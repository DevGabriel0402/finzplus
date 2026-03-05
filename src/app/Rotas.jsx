import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import LayoutPublico from "../layouts/LayoutPublico";
import LayoutApp from "../layouts/LayoutApp";

import Login from "../pages/publico/Login";
import Cadastro from "../pages/publico/Cadastro";

import Dashboard from "../pages/app/Dashboard";
import Lancamentos from "../pages/app/Lancamentos";
import Relatorios from "../pages/app/Relatorios";
import GerenciarUsuarios from "../pages/app/GerenciarUsuarios";

import Configuracoes from "../pages/app/Configuracoes";
import LoadingFinanceiro from "../ui/LoadingFinanceiro";

function RotaProtegida({ children }) {
  const { usuario, perfil, carregando } = useAuth();

  if (carregando) {
    return (
      <LoadingFinanceiro
        visivel={true}
        titulo="Verificando acesso..."
        subtitulo="Aguarde um momento"
      />
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (perfil && perfil.ativo === false) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        background: '#f9fafb'
      }}>
        <h2 style={{ color: '#ef4444' }}>Acesso Suspenso</h2>
        <p style={{ color: '#6b7280', maxWidth: '400px', marginTop: '10px' }}>
          Sua conta foi desativada por um administrador. Entre em contato com o suporte se acreditar que isso é um erro.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: '#16a34a',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return children;
}

function RotaAdmin({ children }) {
  const { perfil, carregando } = useAuth();

  if (carregando) return null;
  if (perfil?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function Rotas() {
  return (
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Route>

      <Route
        element={
          <RotaProtegida>
            <LayoutApp />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />

        {/* Rotas Administrativas */}
        <Route
          path="/admin/usuarios"
          element={
            <RotaAdmin>
              <GerenciarUsuarios />
            </RotaAdmin>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
