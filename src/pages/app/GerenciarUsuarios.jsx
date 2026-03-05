import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, query, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FiUsers, FiSearch, FiCheckCircle, FiXCircle, FiUserCheck, FiUserX } from "react-icons/fi";
import toast from "react-hot-toast";

const PageContainer = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: ${({ theme }) => theme === "dark" ? "#1f2937" : "#f3f4f6"};
  border: 1px solid ${({ theme }) => theme === "dark" ? "#374151" : "#e5e7eb"};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme === "dark" ? "#f9fafb" : "#111827"};
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#1f2937" : "#ffffff"};
  border: 1px solid ${({ theme }) => theme === "dark" ? "#374151" : "#e5e7eb"};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #16a34a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;

  h3 {
    margin: 0;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.active ? "#dcfce7" : "#fee2e2"};
  color: ${props => props.active ? "#166534" : "#991b1b"};
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.danger ? "#fee2e2" : "#dcfce7"};
  background: transparent;
  color: ${props => props.danger ? "#dc2626" : "#16a34a"};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? "#fef2f2" : "#f0fdf4"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarUsuarios() {
            try {
                const q = query(collection(db, "usuarios"), orderBy("criadoEm", "desc"));
                const snap = await getDocs(q);
                const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsuarios(lista);
            } catch (error) {
                console.error("Erro ao carregar usuários:", error);
                toast.error("Erro ao carregar lista de usuários.");
            } finally {
                setCarregando(false);
            }
        }

        carregarUsuarios();
    }, []);

    async function toggleStatus(userId, statusAtual) {
        try {
            await updateDoc(doc(db, "usuarios", userId), {
                ativo: !statusAtual,
                atualizadoEm: new Date()
            });

            setUsuarios(prev => prev.map(u =>
                u.id === userId ? { ...u, ativo: !statusAtual } : u
            ));

            toast.success(`Usuário ${!statusAtual ? "ativado" : "desativado"} com sucesso!`);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status do usuário.");
        }
    }

    const usuariosFiltrados = usuarios.filter(u =>
        u.email?.toLowerCase().includes(busca.toLowerCase()) ||
        u.id.toLowerCase().includes(busca.toLowerCase())
    );

    if (carregando) {
        return <PageContainer>Carregando usuários...</PageContainer>;
    }

    return (
        <PageContainer>
            <Header>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiUsers /> Gerenciar Acessos
                    </h1>
                    <p style={{ color: "#6b7280" }}>Controle quem pode acessar o sistema FinsPlus</p>
                </div>

                <SearchWrapper>
                    <SearchIcon />
                    <SearchInput
                        placeholder="Buscar por email ou ID..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </SearchWrapper>
            </Header>

            {usuariosFiltrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
                    Nenhum usuário encontrado.
                </div>
            ) : (
                <UserGrid>
                    {usuariosFiltrados.map(u => (
                        <UserCard key={u.id}>
                            <UserHeader>
                                <Avatar>{u.email ? u.email[0].toUpperCase() : "?"}</Avatar>
                                <UserInfo>
                                    <h3>{u.email || "Usuário sem email"}</h3>
                                    <p>ID: {u.id}</p>
                                </UserInfo>
                                <Badge active={u.ativo !== false}>
                                    {u.ativo !== false ? "Ativo" : "Bloqueado"}
                                </Badge>
                            </UserHeader>

                            <div style={{ fontSize: "0.875rem", borderTop: "1px solid #f3f4f6", paddingTop: "0.5rem" }}>
                                <div><strong>Cargo:</strong> {u.role === "admin" ? "Administrador" : "Usuário"}</div>
                                <div><strong>Criado em:</strong> {u.criadoEm?.toDate?.()?.toLocaleDateString() || "N/A"}</div>
                            </div>

                            <Actions>
                                {u.ativo !== false ? (
                                    <ActionButton
                                        danger
                                        onClick={() => toggleStatus(u.id, true)}
                                        disabled={u.role === "admin"} // Evita se auto-bloquear
                                    >
                                        <FiUserX /> Bloquear Acesso
                                    </ActionButton>
                                ) : (
                                    <ActionButton onClick={() => toggleStatus(u.id, false)}>
                                        <FiUserCheck /> Liberar Acesso
                                    </ActionButton>
                                )}
                            </Actions>
                        </UserCard>
                    ))}
                </UserGrid>
            )}
        </PageContainer>
    );
}
