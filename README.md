# 💰 Gestão de Dívidas

> **Controle Financeiro Inteligente** - Organize suas finanças, controle suas dívidas e alcance a liberdade financeira.

![Banner](/icons/icon-512.png)

## 📖 Sobre o Projeto

O **Gestão de Dívidas** é uma aplicação web progressiva (PWA) desenvolvida para ajudar usuários a gerenciar suas finanças pessoais de forma simples e eficiente. Com uma interface moderna e intuitiva, o app permite registrar dívidas, acompanhar pagamentos e visualizar o status financeiro em tempo real.

## ✨ Funcionalidades

-   📱 **PWA (Progressive Web App)**: Instalável em dispositivos móveis e desktop.
-   💸 **Gestão de Dívidas**: Cadastro, edição e exclusão de dívidas.
-   📊 **Dashboard**: Visualização clara do total de dívidas e status de pagamento.
-   🎨 **Interface Moderna**: Design limpo e responsivo.
-   🔐 **Autenticação**: Sistema seguro de login (Firebase).
-   💾 **Dados em Nuvem**: Sincronização em tempo real com Firebase.

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: React, Vite
-   **Linguagem**: JavaScript (ES6+)
-   **Estilização**: Styled Components / CSS Modules
-   **Backend / BaaS**: Google Firebase (Auth, Firestore)
-   **PWA**: Vite Plugin PWA
-   **Roteamento**: React Router DOM
-   **Ícones**: React Icons

## 🚀 Como Executar o Projeto

### Pré-requisitos

-   Node.js (v18 ou superior)
-   npm ou yarn

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/gestao-dividas.git
    cd gestao-dividas
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    -   Crie um arquivo `.env` na raiz do projeto.
    -   Adicione as chaves de configuração do Firebase (veja `.env.example` se disponível).

4.  Execute em modo de desenvolvimento:
    ```bash
    npm run dev
    ```

5.  Acesse no navegador:
    -   `http://localhost:5173`

## 📦 Build para Produção

Para gerar a versão otimizada para produção:

```bash
npm run build
```

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

Desenvolvido com 💙 por Gabriel.