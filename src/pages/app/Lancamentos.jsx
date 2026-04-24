import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

import {
  criarLancamento,
  excluirLancamento,
  listarLancamentosSemIndice,
  marcarComoPago,
  marcarComoPendente,
  atualizarLancamento,
  criarLancamentosEmLote,
} from "../../services/lancamentos";

import { hojeISO, mesRefDeDataISO, adicionarMeses } from "../../utils/datas";
import { formatarMoedaBRLInput, parseMoedaBRL } from "../../utils/dinheiro";
import LancamentosUI from "./lancamentos/LancamentosUI";

export default function Lancamentos() {
  const { usuario } = useAuth();

  const [mesRef, setMesRef] = useState(mesRefDeDataISO(hojeISO()));
  const [aba, setAba] = useState("pendente"); // "pendente" | "pago"
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Form state
  const [tipo, setTipo] = useState("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState(formatarMoedaBRLInput(""));
  const [data, setData] = useState(hojeISO());
  const [categoria, setCategoria] = useState("Moradia");
  const [origemDestino, setOrigemDestino] = useState("Conta de Luz");
  const [conta, setConta] = useState("Pix");
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [parcelas, setParcelas] = useState(1);

  // ✅ Estado de edição
  const [itemEmEdicao, setItemEmEdicao] = useState(null);

  function onEditar(item) {
    if (!item) return;
    setItemEmEdicao(item);
  }

  function onCancelarEdicao() {
    setItemEmEdicao(null);
    setDescricao("");
    setValor(formatarMoedaBRLInput(""));
    setTipo("saida");
    // mantemos data/categoria/etc ou resetamos? Reset básico:
    setData(hojeISO());
  }

  async function carregar() {
    if (!usuario?.uid) {
      console.log("UserID indefined or null", usuario);
      return;
    }
    setCarregando(true);

    try {
      let statusFiltro = null;
      let tipoFiltro = null;

      if (aba === "pendente") {
        statusFiltro = "pendente";
        tipoFiltro = "saida"; // Pendente de pagamento (apenas saídas)
      } else if (aba === "pago") {
        statusFiltro = "pago";
        tipoFiltro = "saida"; // Pagos (apenas saídas)
      } else if (aba === "entrada") {
        tipoFiltro = "entrada"; // Entradas (independente do status, geralmente 'pago' ou 'pendente')
      }

      console.log("UseID: ", usuario.uid);
      console.log("Mes Ref: ", mesRef);
      console.log("Status Filtro: ", statusFiltro);
      console.log("Tipo Filtro: ", tipoFiltro);

      const dados = await listarLancamentosSemIndice(usuario.uid, mesRef, statusFiltro, tipoFiltro);
      console.log("Dados retornados: ", dados);
      setLista(dados);
    } catch (e) {
      console.log("ERRO AO CARREGAR LANÇAMENTOS:", e?.code, e?.message, e);
      toast.error("Erro ao carregar lançamentos.", { id: "erro-carregar-lancamentos" });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.uid, mesRef, aba]);

  // ... inside Lancamentos component
  console.log("RENDER Lancamentos | Lista length:", lista.length, "| Carregando:", carregando);

  useEffect(() => {
    console.log("EFFECT: lista updated:", lista);
  }, [lista]);

  const totalAba = useMemo(
    () => lista.reduce((acc, l) => acc + (l.valor || 0), 0),
    [lista],
  );
  const qtdAba = lista.length;

  async function onCriar(e) {
    e.preventDefault();

    const desc = String(descricao || "").trim();
    const cat = String(categoria || "").trim();
    const od = String(origemDestino || "").trim();
    const cta = String(conta || "").trim();

    if (!desc) return toast.error("Descrição é obrigatória.", { id: "erro-desc" });
    const v = parseMoedaBRL(valor);
    if (!v || v <= 0)
      return toast.error("Informe um valor válido.", { id: "erro-valor" });
    if (!cat) return toast.error("Categoria é obrigatória.", { id: "erro-categoria" });
    if (!od) return toast.error("Origem/Destino é obrigatório.", { id: "erro-od" });
    if (!cta) return toast.error("Forma de Pagamento é obrigatória.", { id: "erro-conta" });

    const dataFinal = data || hojeISO();
    const mesRefFinal = mesRefDeDataISO(dataFinal);

    try {
      if (tipo === "saida" && (isRecorrente || parcelas > 1)) {
        const listaParaCriar = [];
        const qtd = isRecorrente ? 12 : parcelas;

        for (let i = 0; i < qtd; i++) {
          const dataParcela = adicionarMeses(dataFinal, i);
          const mesRefParcela = mesRefDeDataISO(dataParcela);
          
          let descFinal = desc;
          if (parcelas > 1) {
            descFinal = `${desc} (${i + 1}/${parcelas})`;
          }

          listaParaCriar.push({
            tipo,
            descricao: descFinal,
            valor: v,
            data: dataParcela,
            mesRef: mesRefParcela,
            categoria: cat,
            origemDestino: od,
            conta: cta,
            // Metadados para badges
            recorrente: isRecorrente,
            parcelado: parcelas > 1,
            parcelaAtual: i + 1,
            totalParcelas: parcelas,
          });
        }

        await criarLancamentosEmLote(usuario.uid, listaParaCriar);
        toast.success(isRecorrente ? "Itens recorrentes criados (12 meses)." : `${parcelas} parcelas criadas.`);
      } else {
        await criarLancamento(usuario.uid, {
          tipo,
          descricao: desc,
          valor: v,
          data: dataFinal,
          mesRef: mesRefFinal,
          categoria: cat,
          origemDestino: od,
          conta: cta,
        });
        toast.success("Lançamento criado (pendente).", { id: "ok-criar" });
      }

      setDescricao("");
      setValor(formatarMoedaBRLInput(""));
      setIsRecorrente(false);
      setParcelas(1);

      // Mostra o item criado
      if (mesRef !== mesRefFinal) setMesRef(mesRefFinal);
      if (tipo === "entrada") {
        if (aba !== "entrada") setAba("entrada");
        else await carregar();
      } else {
        if (aba !== "pendente") setAba("pendente");
        else await carregar();
      }
    } catch (e2) {
      console.log("ERRO AO CRIAR:", e2?.code, e2?.message, e2);
      toast.error("Erro ao criar lançamento.", { id: "erro-criar" });
    }
  }

  async function onSalvarEdicao(id, dados) {
    try {
      const mesRefEditado = mesRefDeDataISO(dados.data);
      await atualizarLancamento(usuario.uid, id, {
        ...dados,
        mesRef: mesRefEditado
      });
      toast.success("Editado com sucesso!");
      setItemEmEdicao(null);
      await carregar();
    } catch (e) {
      toast.error("Erro ao editar.");
    }
  }

  async function onExcluir(id) {
    try {
      await excluirLancamento(usuario.uid, id);
      toast.success("Excluído.", { id: "ok-excluir" });
      await carregar();
    } catch (e) {
      console.log("ERRO AO EXCLUIR:", e?.code, e?.message, e);
      toast.error("Erro ao excluir.", { id: "erro-excluir" });
    }
  }

  async function onTogglePago(item) {
    try {
      if (item.status === "pago") {
        await marcarComoPendente(usuario.uid, item.id);
        toast.success("Voltou para pendente.", { id: "ok-voltar" });
      } else {
        await marcarComoPago(usuario.uid, item.id);
        toast.success("Marcado como pago.", { id: "ok-pago" });
      }
      await carregar();
    } catch (e) {
      console.log("ERRO AO ATUALIZAR STATUS:", e?.code, e?.message, e);
      toast.error("Erro ao atualizar status.", { id: "erro-status" });
    }
  }

  return (
    <LancamentosUI
      mesRef={mesRef}
      setMesRef={setMesRef}
      aba={aba}
      setAba={setAba}
      qtdAba={qtdAba}
      totalAba={totalAba}
      form={{
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
        isRecorrente,
        setIsRecorrente,
        parcelas,
        setParcelas,
      }}
      onCriar={onCriar}
      carregando={carregando}
      lista={lista}
      onTogglePago={onTogglePago}
      onExcluir={onExcluir}
      // ✅ Props de edição (Modal)
      itemEmEdicao={itemEmEdicao}
      onEditar={onEditar}
      onSalvarEdicao={onSalvarEdicao}
      onCancelarEdicao={onCancelarEdicao}
    />
  );
}
