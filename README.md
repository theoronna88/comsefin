# Comsefaz-FIN

## English

### Project Description

Comsefaz-FIN is a financial management application developed for Comsefaz (National Committee of Secretaries of Finance, Finance, Revenue or Taxation of the States and the Federal District). This project aims to provide a comprehensive and intuitive platform for managing budgets, expenses, and revenues, integrating with Conta Azul for data synchronization.

### Features

- **Authentication:** Secure login with Conta Azul credentials.
- **Dashboard:** Interactive visualizations of financial data, including:
  - Year-over-year comparisons.
  - Expense and revenue breakdowns.
  - Pie charts for categorical expense distribution.
- **Budget Management:** Create, read, update, and delete budget entries.
- **Expense and Revenue Tracking:** List and manage expenses and revenues synchronized from Conta Azul.
- **Responsive Design:** User-friendly interface for both desktop and mobile devices.

### Technologies Used

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Data Visualization:** Recharts

### Getting Started

To run this project locally, follow these steps:

#### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- PostgreSQL

#### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/comsefaz-fin.git
    cd comsefaz-fin
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Set up the environment variables by creating a `.env` file in the root of the project. See the [Environment Variables](#environment-variables) section for more details.

4.  Apply the database migrations:

    ```bash
    npx prisma migrate dev
    ```

5.  Generate the Prisma client:
    ```bash
    npx prisma generate
    ```

#### Running the Project

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```bash
# PostgreSQL Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Conta Azul API Credentials
NEXT_CLIENT_ID="your-conta-azul-client-id"
NEXT_CLIENT_SECRET="your-conta-azul-client-secret"
NEXT_REDIRECT_URI="http://localhost:3000/conta-azul/callback"
```

---

## Português

### Descrição do Projeto

Comsefaz-FIN é uma aplicação de gestão financeira desenvolvida para o Comsefaz (Comitê Nacional de Secretários de Fazenda, Finanças, Receita ou Tributação dos Estados e do Distrito Federal). Este projeto tem como objetivo fornecer uma plataforma abrangente e intuitiva para gerenciar orçamentos, despesas e receitas, com integração com a Conta Azul para sincronização de dados.

### Funcionalidades

- **Autenticação:** Login seguro com credenciais da Conta Azul.
- **Dashboard:** Visualizações interativas de dados financeiros, incluindo:
  - Comparações ano a ano.
  - Detalhamento de despesas e receitas.
  - Gráficos de pizza para distribuição de despesas por categoria.
- **Gerenciamento de Orçamento:** Crie, leia, atualize e exclua lançamentos orçamentários.
- **Acompanhamento de Despesas e Receitas:** Liste and gerencie despesas e receitas sincronizadas da Conta Azul.
- **Design Responsivo:** Interface amigável para dispositivos desktop e móveis.

### Tecnologias Utilizadas

- **Framework:** Next.js 14
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** NextAuth.js
- **Estilização:** Tailwind CSS
- **Componentes de UI:** Shadcn/UI
- **Visualização de Dados:** Recharts

### Começando

Para executar este projeto localmente, siga estes passos:

#### Pré-requisitos

- Node.js (v18.x ou superior)
- npm ou yarn
- PostgreSQL

#### Instalação

1.  Clone o repositório:

    ```bash
    git clone https://github.com/seu-usuario/comsefaz-fin.git
    cd comsefaz-fin
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto. Veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente) para mais detalhes.

4.  Aplique as migrações do banco de dados:

    ```bash
    npx prisma migrate dev
    ```

5.  Gere o cliente Prisma:
    ```bash
    npx prisma generate
    ```

#### Executando o Projeto

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/BANCO_DE_DADOS"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-super-secreta"

# Credenciais da API da Conta Azul
NEXT_CLIENT_ID="seu-client-id-da-conta-azul"
NEXT_CLIENT_SECRET="seu-client-secret-da-conta-azul"
NEXT_REDIRECT_URI="http://localhost:3000/conta-azul/callback"
```
