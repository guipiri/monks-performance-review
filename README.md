# Monks Performance Review

Sistema para Avaliação de Desempenho profissional desenvolvido com arquitetura Monorepo, integrando frontend SPA em **React 19** e backend em **FastAPI (Python)** com **PostgreSQL**.

---

## Arquitetura e Fluxo do Sistema

### Visão Geral da Arquitetura

```mermaid
graph TD
    subgraph Monorepo ["Monorepo"]
        subgraph Web ["apps/web (Frontend)"]
            React["React 19 + TypeScript"]
            Vite["Vite Bundler"]
            Tailwind["Tailwind CSS"]
            TanStack["TanStack Query (Cache & State)"]
            Axios["Axios (HTTP + Interceptor JWT)"]
        end

        subgraph API ["apps/api (Backend)"]
            FastAPI["FastAPI (Python 3.12+)"]
            Uvicorn["Uvicorn ASGI Server"]
            SQLAlchemy["SQLAlchemy 2.0 ORM"]
            Alembic["Alembic (Database Migrations)"]
            Security["Auth JWT (Argon2 / Bcrypt)"]
        end

        subgraph Infra ["Infraestrutura Local"]
            Postgres[("PostgreSQL 16 (Docker)")]
        end
    end

    User(["👤 Usuário / Líder / Colaborador"]) -->|Navegador| Web
    Web -->|Requisições REST / Bearer Token| API
    API -->|Consultas e Persistência| Postgres
```

---

### Fluxo de Autenticação e Avaliação

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário (Líder/Colaborador)
    participant Web as Frontend (React/Vite)
    participant API as Backend (FastAPI)
    participant DB as PostgreSQL

    Note over User,DB: 1. Fluxo de Autenticação
    User->>Web: Informa e-mail e senha
    Web->>API: POST /api/v1/auth/login (OAuth2 Password Data)
    API->>DB: Valida credenciais e hash de senha
    DB-->>API: Usuário autenticado
    API-->>Web: Retorna JWT Token
    Web->>Web: Armazena token e redireciona

    Note over User,DB: 2. Listagem de Liderados & Histórico
    User->>Web: Acessa Dashboard / Avaliações
    Web->>API: GET /api/v1/users/me/leads (com Header Bearer Token)
    API->>DB: Busca liderados vinculados ao usuário logado
    DB-->>API: Lista de colaboradores
    API-->>Web: Resposta JSON
    Web-->>User: Exibe cartões dos liderados

    Note over User,DB: 3. Submissão de Avaliação Ponderada
    User->>Web: Preenche notas (1-4) nos 6 critérios e envia
    Web->>API: POST /api/v1/evaluations
    API->>API: Calcula nota final ponderada (Pesos 25, 20, 20, 15, 10, 10)
    API->>DB: Persiste registro de avaliação
    DB-->>API: Confirmação
    API-->>Web: Avaliação registrada com sucesso
    Web-->>User: Feedback visual & atualização da listagem
```

---

## Critérios de Avaliação Ponderada

O cálculo da nota final que vai de 0 a 4 considera 6 pilares de competências com pesos distribuídos:

| Critério | Descrição | Peso |
| :--- | :--- | :---: |
| **Entrega de Resultados** | Capacidade de atingir metas com consistência e impacto. | **25%** |
| **Execução e Qualidade** | Excelência técnica, atenção a detalhes e boas práticas. | **20%** |
| **Aprendizado e Desenvolvimento** | Curiosidade, adaptabilidade e absorção de novos conhecimentos. | **20%** |
| **Resolução de Problemas** | Pensamento crítico para solucionar problemas. | **15%** |
| **Colaboração e Liderança** | Trabalho em equipe, comunicação e suporte aos pares. | **10%** |
| **Visão Estratégica** | Entendimento do negócio e potencial de crescimento. | **10%** |

---

## Pré-requisitos

Certifique-se de possuir instalado em seu ambiente:

- **Node.js**: `>= 24.0.0`
- **Yarn**: `1.22.x` (ou via Corepack)
- **Python**: `>= 3.12`
- **uv** (gerenciador ultrarrápido de pacotes Python): [Instalação do uv](https://docs.astral.sh/uv/)
- **Docker** e **Docker Compose**: para execução do banco PostgreSQL local.

---

## Instruções de Setup

### i. Onde Colocar as Chaves e Variáveis de Ambiente

Localmente, não é necessário criar variáveis de ambiente pois o projeto possui configurações pré-definidas. Mas você pode customizar os arquivos `.env` caso deseje:

#### 1. Backend (`apps/api/.env`)
Crie ou edite o arquivo `apps/api/.env` (um template está disponível em `apps/api/.env.example`):

```env
# Banco de Dados PostgreSQL
DATABASE_URL=postgresql+psycopg://admin:admin@localhost:5432/monks-performance-review

# Segurança & Autenticação JWT
SECRET_KEY=super-secret-key-change-in-production-1234567890
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Configurações Gerais da API
PROJECT_NAME="Monks Performance Review API"
API_V1_STR=/api/v1
```

#### 2. Frontend (`apps/web/.env`)
Crie ou edite o arquivo `apps/web/.env` (um template está disponível em `apps/web/.env.example`):

```env
# URL base da API FastAPI
VITE_API_URL=http://localhost:8000/api/v1
```

---

### ii. Execução Passo a Passo

Siga o passo a passo abaixo para clonar o repositório, instalar as dependências, inicializar o banco de dados, aplicar as migrações, popular dados iniciais e rodar os servidores:

#### Passo 1: Clonar o Repositório
Clone o repositório e acesse a pasta do projeto:

```bash
git clone https://github.com/guipiri/monks-performance-review.git
cd monks-performance-review
```

#### Passo 2: Instalar as Dependências
Na raiz do projeto, instale as dependências de todo o monorepo (Node e Python):

```bash
# 1. Instalar dependências JavaScript/TypeScript no monorepo
yarn install

# 2. Instalar dependências Python no backend (apps/api)
cd apps/api
uv sync
cd ../..
```

#### Passo 3: Iniciar o Banco de Dados (PostgreSQL)
Inicie o container PostgreSQL em segundo plano:

```bash
docker compose up -d database
```

> O banco de dados estará acessível em `localhost:5432` com usuário `admin` e banco `monks-performance-review`.

#### Passo 4: Executar as Migrações do Banco
Rode as migrações via Alembic para criar todas as tabelas:

```bash
# A partir da raiz:
yarn --cwd apps/api db:migrate

# Ou diretamente dentro de apps/api:
# cd apps/api && uv run alembic upgrade head
```

#### Passo 5: Popular o Banco de Dados (Seeds)
Execute o script de seed para criar usuários, estrutura organizacional e relações de liderança:

```bash
# A partir da raiz:
yarn --cwd apps/api db:seed

# Ou diretamente dentro de apps/api:
# cd apps/api && uv run python -m src.db.seeds
```

#### Passo 6: Iniciar a Aplicação em Desenvolvimento
Execute o comando de inicialização unificada na raiz do projeto:

```bash
yarn dev
```

O **Turborepo** iniciará simultaneamente:
- **Frontend (Web)**: [http://localhost:5173](http://localhost:5173)
- **Backend (API)**: [http://localhost:8000](http://localhost:8000)
- **Documentação Swagger/OpenAPI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Credenciais para Teste

Após rodar o script `db:seed`, todos os usuários de exemplo compartilham a mesma senha padrão:

- **Senha Padrão**: `password123`

### Exemplos de Usuários Pré-configurados:

| Usuário | E-mail | Cargo | Liderados |
| :--- | :--- | :--- | :--- |
| **Bob Sinclair** | `bob.sinclair@company.com` | CTO | David Okafor, Eva Müller, Frank Rossi, Grace Kim, etc. |
| **David Okafor** | `david.okafor@company.com` | Engineering Manager | Henry Patel, Leo Vance |
| **Eva Müller** | `eva.muller@company.com` | Engineering Manager | Isabelle Dubois, Maria Santos, Noah Taylor |
| **Carol Nguyen** | `carol.nguyen@company.com` | CFO | Rachel Green, Samuel Adams |
| **Frank Rossi** | `frank.rossi@company.com` | Product Manager | Olivia Brown |

> **Dica**: Acesse com `bob.sinclair@company.com` para gerenciar e avaliar múltiplos líderes e membros de equipe.

---
