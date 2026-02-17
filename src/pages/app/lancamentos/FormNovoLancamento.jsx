import React, { useMemo } from "react";
import styled from "styled-components";
import { Card } from "../../../ui/Base";
import { Campo, Label } from "../../../ui/Campo";
import { CampoData } from "../../../ui/CampoData.jsx";
import { SelectCustomizado } from "../../../ui/SelectCustomizado";
import { Botao } from "../../../ui/Botao";
import { formatarMoedaBRLInput } from "../../../utils/dinheiro";

import {
  FiHome,
  FiTruck,
  FiShoppingBag,
  FiCoffee,
  FiZap,
  FiMapPin,
  FiCreditCard,
  FiDollarSign,
  FiHeart,
  FiBookOpen,
  FiActivity,
  FiWifi,
  FiPhone,
  FiFilm,
  FiGift,
  FiTool,
  FiBriefcase,
  FiTrendingUp,
  FiShield,
  FiScissors,
  FiSend,
  FiDroplet,
  FiMusic,
  FiTag,
  FiGrid,
  FiCpu,
  FiShoppingCart,
  FiCalendar,
} from "react-icons/fi";

const GridSelects = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export default function FormNovoLancamento({
  tipo,
  setTipo,
  descricao,
  setDescricao,
  valor,
  setValor,
  data,
  setData,
  categoria,
  setCategoria,
  origemDestino,
  setOrigemDestino,
  conta,
  setConta,
  onCriar,
}) {
  // =========================
  // CATEGORIAS (muitas opções)
  // =========================
  const categoriasSaida = useMemo(
    () => [
      { value: "Moradia", label: "Moradia", icon: FiHome },
      { value: "Contas Fixas", label: "Contas Fixas", icon: FiZap },
      { value: "Alimentação", label: "Alimentação", icon: FiCoffee },
      { value: "Transporte", label: "Transporte", icon: FiTruck },
      { value: "Compras", label: "Compras", icon: FiShoppingBag },
      { value: "Saúde", label: "Saúde", icon: FiHeart },
      { value: "Educação", label: "Educação", icon: FiBookOpen },
      { value: "Lazer", label: "Lazer", icon: FiFilm },
      { value: "Assinaturas", label: "Assinaturas", icon: FiMusic },
      { value: "Comunicação", label: "Comunicação", icon: FiWifi },
      { value: "Beleza", label: "Beleza", icon: FiScissors },
      { value: "Serviços", label: "Serviços", icon: FiTool },
      { value: "Impostos", label: "Impostos", icon: FiShield },
      { value: "Dívidas/Empréstimos", label: "Dívidas/Empréstimos", icon: FiCreditCard },
      { value: "Cartão de Crédito", label: "Cartão de Crédito", icon: FiCreditCard },
      { value: "Pets", label: "Pets", icon: FiActivity },
      { value: "Viagens", label: "Viagens", icon: FiSend },
      { value: "Presentes/Doações", label: "Presentes/Doações", icon: FiGift },
      { value: "Tecnologia", label: "Tecnologia", icon: FiCpu },
      { value: "Casa e Manutenção", label: "Casa e Manutenção", icon: FiTool },
      { value: "Compras Online", label: "Compras Online", icon: FiShoppingCart },
      { value: "Eventos", label: "Eventos", icon: FiCalendar },
      { value: "Outros", label: "Outros", icon: FiGrid },
    ],
    [],
  );

  const categoriasEntrada = useMemo(
    () => [
      { value: "Salário", label: "Salário", icon: FiBriefcase },
      { value: "Freelance", label: "Freelance", icon: FiTag },
      { value: "Vendas", label: "Vendas", icon: FiShoppingBag },
      { value: "Investimentos", label: "Investimentos", icon: FiTrendingUp },
      { value: "Bônus/Comissão", label: "Bônus/Comissão", icon: FiDollarSign },
      { value: "Reembolso", label: "Reembolso", icon: FiShield },
      { value: "Presente", label: "Presente", icon: FiGift },
      { value: "Outros", label: "Outros", icon: FiMapPin },
    ],
    [],
  );

  // =====================================
  // ORIGENS / DESTINOS (muitas opções)
  // =====================================
  const origensDestinosSaida = useMemo(
    () => [
      // Moradia / Contas
      { value: "Aluguel", label: "Aluguel", icon: FiHome },
      { value: "Condomínio", label: "Condomínio", icon: FiHome },
      { value: "Conta de Luz", label: "Conta de Luz", icon: FiZap },
      { value: "Conta de Água", label: "Conta de Água", icon: FiDroplet },
      { value: "Gás", label: "Gás", icon: FiZap },
      { value: "Internet", label: "Internet", icon: FiWifi },
      { value: "Telefone", label: "Telefone", icon: FiPhone },

      // Alimentação
      { value: "Mercado", label: "Mercado", icon: FiShoppingBag },
      { value: "Supermercado", label: "Supermercado", icon: FiShoppingBag },
      { value: "Padaria", label: "Padaria", icon: FiCoffee },
      { value: "Restaurante", label: "Restaurante", icon: FiCoffee },
      { value: "Delivery", label: "Delivery", icon: FiCoffee },
      { value: "Lanches", label: "Lanches", icon: FiCoffee },

      // Transporte
      { value: "Combustível", label: "Combustível", icon: FiTruck },
      { value: "Uber/99", label: "Uber/99", icon: FiTruck },
      { value: "Ônibus/Metrô", label: "Ônibus/Metrô", icon: FiTruck },
      { value: "Estacionamento", label: "Estacionamento", icon: FiTruck },
      { value: "Manutenção do Carro", label: "Manutenção do Carro", icon: FiTool },
      { value: "IPVA/Licenciamento", label: "IPVA/Licenciamento", icon: FiShield },

      // Saúde
      { value: "Farmácia", label: "Farmácia", icon: FiHeart },
      { value: "Consulta", label: "Consulta", icon: FiHeart },
      { value: "Exames", label: "Exames", icon: FiHeart },
      { value: "Plano de Saúde", label: "Plano de Saúde", icon: FiHeart },
      { value: "Academia", label: "Academia", icon: FiActivity },

      // Educação
      { value: "Curso", label: "Curso", icon: FiBookOpen },
      { value: "Mensalidade", label: "Mensalidade", icon: FiBookOpen },
      { value: "Livros", label: "Livros", icon: FiBookOpen },

      // Lazer
      { value: "Cinema", label: "Cinema", icon: FiFilm },
      { value: "Viagem", label: "Viagem", icon: FiSend },
      { value: "Passeio", label: "Passeio", icon: FiMapPin },

      // Assinaturas / Serviços
      { value: "Streaming", label: "Streaming", icon: FiFilm },
      { value: "Software", label: "Software", icon: FiCpu },
      { value: "Serviços Online", label: "Serviços Online", icon: FiWifi },

      // Compras
      { value: "Roupas", label: "Roupas", icon: FiShoppingBag },
      { value: "Calçados", label: "Calçados", icon: FiShoppingBag },
      { value: "Eletrônicos", label: "Eletrônicos", icon: FiCpu },
      { value: "Casa", label: "Casa", icon: FiHome },

      // Financeiro
      { value: "Cartão de Crédito", label: "Cartão de Crédito", icon: FiCreditCard },
      { value: "Empréstimo", label: "Empréstimo", icon: FiCreditCard },
      { value: "Financiamento", label: "Financiamento", icon: FiCreditCard },
      { value: "Banco/Tarifas", label: "Banco/Tarifas", icon: FiDollarSign },
      { value: "Juros/Multas", label: "Juros/Multas", icon: FiDollarSign },

      // Outros
      { value: "Outro", label: "Outro", icon: FiMapPin },
    ],
    [],
  );

  const origensDestinosEntrada = useMemo(
    () => [
      { value: "Empresa (Salário)", label: "Empresa (Salário)", icon: FiBriefcase },
      { value: "Cliente (Design/Freela)", label: "Cliente (Design/Freela)", icon: FiTag },
      { value: "Venda", label: "Venda", icon: FiShoppingBag },
      { value: "Dividendo/Juros", label: "Dividendo/Juros", icon: FiTrendingUp },
      {
        value: "Resgate de Investimento",
        label: "Resgate de Investimento",
        icon: FiTrendingUp,
      },
      { value: "Reembolso", label: "Reembolso", icon: FiShield },
      { value: "Presente", label: "Presente", icon: FiGift },
      { value: "Outro", label: "Outro", icon: FiMapPin },
    ],
    [],
  );

  // =========================
  // CONTA / FORMA PAGAMENTO
  // =========================
  const opcoesConta = [
    { value: "Pix", label: "Pix", icon: FiDollarSign },
    { value: "Débito", label: "Débito", icon: FiCreditCard },
    { value: "Crédito", label: "Crédito", icon: FiCreditCard },
    { value: "Boleto", label: "Boleto", icon: FiDollarSign },
    { value: "Transferência", label: "Transferência", icon: FiDollarSign },
    { value: "Dinheiro", label: "Dinheiro", icon: FiDollarSign },
  ];

  // =========================
  // Opções dependem do tipo
  // =========================
  const opcoesCategoria = useMemo(() => {
    return tipo === "entrada" ? categoriasEntrada : categoriasSaida;
  }, [tipo, categoriasEntrada, categoriasSaida]);

  const opcoesOrigemDestino = useMemo(() => {
    return tipo === "entrada" ? origensDestinosEntrada : origensDestinosSaida;
  }, [tipo, origensDestinosEntrada, origensDestinosSaida]);

  return (
    <Card>
      <h4 style={{ marginTop: 0 }}>Novo lançamento (vai para “A pagar”)</h4>

      <form onSubmit={onCriar} style={{ display: "grid", gap: 12 }}>
        <div>
          <Label>Tipo</Label>
          <SelectCustomizado
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={[
              { value: "entrada", label: "Entrada" },
              { value: "saida", label: "Saída" },
            ]}
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Campo value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <Label>Valor</Label>
            <Campo
              value={valor}
              onChange={(e) => setValor(formatarMoedaBRLInput(e.target.value))}
              inputMode="numeric"
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label>Vencimento</Label>
            <CampoData
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
        </div>

        <GridSelects>
          <div>
            <Label>Categoria</Label>
            <SelectCustomizado
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              options={opcoesCategoria}
              placeholder="Selecione a categoria"
            />
          </div>

          <div>
            <Label>Origem/Destino</Label>
            <SelectCustomizado
              value={origemDestino}
              onChange={(e) => setOrigemDestino(e.target.value)}
              options={opcoesOrigemDestino}
              placeholder="Selecione a origem/destino"
            />
          </div>

          <div>
            <Label>Conta</Label>
            <SelectCustomizado
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              options={opcoesConta}
              placeholder="Selecione a conta"
            />
          </div>
        </GridSelects>

        <Botao>Criar</Botao>
      </form>
    </Card>
  );
}
