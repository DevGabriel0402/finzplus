// src/services/estruturaInicial.js
import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

async function subcolecaoEstaVazia(uid, nomeSubcolecao) {
    const colRef = collection(db, "usuarios", uid, nomeSubcolecao);
    const snap = await getCountFromServer(colRef);
    return (snap.data().count || 0) === 0;
}

export async function criarEstruturaInicial(uid, email) {
    // 1) Doc principal do usuário (merge = não sobrescreve se já existir)
    await setDoc(
        doc(db, "usuarios", uid),
        {
            email: email || "",
            role: "user",
            ativo: true,
            atualizadoEm: serverTimestamp(),
            criadoEm: serverTimestamp(),
        },
        { merge: true }
    );

    // 2) Categorias padrão (cria somente se estiver vazio)
    const categoriasVazia = await subcolecaoEstaVazia(uid, "categorias");

    if (categoriasVazia) {
        const categoriasPadrao = [
            { nome: "Renda", tipo: "entrada", icone: "trending-up" },
            { nome: "Investimentos", tipo: "entrada", icone: "bar-chart" },

            { nome: "Moradia", tipo: "saida", icone: "home" },
            { nome: "Alimentação", tipo: "saida", icone: "utensils" },
            { nome: "Transporte", tipo: "saida", icone: "car" },
            { nome: "Saúde", tipo: "saida", icone: "heart" },
            { nome: "Lazer", tipo: "saida", icone: "gamepad-2" },

            { nome: "Outros", tipo: "ambos", icone: "layers" },
        ];

        for (const c of categoriasPadrao) {
            await addDoc(collection(db, "usuarios", uid, "categorias"), {
                ...c,
                ativo: true,
                criadoEm: serverTimestamp(),
            });
        }
    }

    // 3) Contas padrão (cria somente se estiver vazio)
    const contasVazia = await subcolecaoEstaVazia(uid, "contas");

    if (contasVazia) {
        const contasPadrao = [
            { nome: "Pix", tipo: "pix", iconeKey: "pix" },
            { nome: "Carteira", tipo: "carteira", iconeKey: "carteira" },
        ];

        for (const conta of contasPadrao) {
            await addDoc(collection(db, "usuarios", uid, "contas"), {
                ...conta,
                saldoInicial: 0,
                ativo: true,
                criadoEm: serverTimestamp(),
            });
        }
    }

    // 4) Origens/Destinos padrão (opcional — ajuda muito no começo)
    const origensVazia = await subcolecaoEstaVazia(uid, "origensDestinos");

    if (origensVazia) {
        const origensDestinosPadrao = [
            // Entradas
            { nome: "Salário", tipo: "entrada" },
            { nome: "Freelance Designer", tipo: "entrada" },
            { nome: "Investimento (recebido)", tipo: "entrada" },

            // Saídas
            { nome: "Conta de Luz", tipo: "saida" },
            { nome: "Internet", tipo: "saida" },
            { nome: "Aluguel", tipo: "saida" },
            { nome: "Mercado", tipo: "saida" },
            { nome: "Cartão de Crédito", tipo: "saida" },
        ];

        for (const od of origensDestinosPadrao) {
            await addDoc(collection(db, "usuarios", uid, "origensDestinos"), {
                ...od,
                ativo: true,
                criadoEm: serverTimestamp(),
            });
        }
    }
}
