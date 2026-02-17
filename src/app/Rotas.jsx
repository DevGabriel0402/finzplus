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

import Configuracoes from "../pages/app/Configuracoes";
import LoadingFinanceiro from "../ui/LoadingFinanceiro";

function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
