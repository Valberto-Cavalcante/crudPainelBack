# Educandus Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.16+-blue.svg)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-black.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação e Configuração](#instalação-e-configuração)
- [Modelo de Dados](#modelo-de-dados)
- [Entidades](#entidades)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts de Inicialização](#scripts-de-inicialização)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O **Educandus Backend** é uma API RESTful desenvolvida em Node.js que gerencia um sistema educacional completo. A aplicação oferece funcionalidades para gestão de usuários, instituições, menus dinâmicos, vínculos e configurações do sistema.

### Principais Funcionalidades

- 🔐 **Autenticação e Autorização**: Sistema de login com JWT e controle de perfis
- 👥 **Gestão de Usuários**: CRUD completo de usuários com diferentes perfis
- 🏫 **Gestão de Instituições**: Hierarquia de instituições educacionais
- 📚 **Gestão de Séries**: Organização de séries/anos escolares
- 🎓 **Gestão de Turmas**: Turmas organizadas por série e instituição
- 👨‍🏫 **Gestão de Professores**: Vínculos professor-turma com disciplinas
- 📋 **Menus Dinâmicos**: Sistema de menus configuráveis por perfil
- 🔗 **Vínculos**: Relacionamentos entre usuários e instituições
- ⚙️ **Configurações**: Sistema flexível de configurações do sistema
- 📊 **Auditoria**: Log automático de todas as ações administrativas

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MongoDB       │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   JWT Auth      │
                       │   Middleware    │
                       └─────────────────┘
```

## 🛠️ Tecnologias

| Tecnologia              | Versão | Propósito           |
| ----------------------- | ------- | -------------------- |
| **Node.js**       | 18.x    | Runtime JavaScript   |
| **Express.js**    | 4.18+   | Framework Web        |
| **MongoDB**       | 4.16+   | Banco de Dados       |
| **JWT**           | 9.0+    | Autenticação       |
| **bcryptjs**      | 3.0+    | Hash de Senhas       |
| **CORS**          | 2.8+    | Cross-Origin         |
| **Passport**      | 0.6+    | Estratégias de Auth |
| **Morgan**        | 1.9+    | Logging              |
| **Cookie Parser** | 1.4+    | Parse de Cookies     |

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- MongoDB 4.16+ ou MongoDB Atlas
- npm ou yarn

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd educandus/backendEducandus
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Ambiente
STATUS_PROJETO=development

# Servidor
PORT=50010

# SSL (apenas para produção)
SSL_KEY_PATH=/etc/ssl/private/server.key
SSL_CERT_PATH=/etc/ssl/certs/server.crt

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Inicialize o Banco de Dados

```bash
# Criar usuário administrador
npm run setup

# Criar configurações padrão
npm run init

# Criar menus padrão (opcional)
npm run create-menu
```

### 5. Execute a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm start
```

A API estará disponível em `http://localhost:50010`

## 📊 Modelo de Dados

### 🎯 **INSTRUÇÕES PARA IA GERAR DIAGRAMA ER**

**Para uma IA mais potente gerar o diagrama ER completo, use esta descrição:**

```
Crie um diagrama ER (Entity Relationship) para um sistema educacional com as seguintes entidades e relacionamentos:

ENTIDADES PRINCIPAIS:
1. USERS (Usuários) - PK: id, campos: email(UK), userName(UK), pass, nome, perfis[], ativo, __new, __editado
2. INSTITUICOES (Instituições) - PK: id, campos: nome, subdominio(UK), idInstituicaoSuperior(FK), tipo, ativo, __new, __editado
3. PERFIS (Perfis) - PK: id, campos: nome, descricao, permissoes[], ativo, __new, __editado
4. SERIES (Séries) - PK: id, campos: name, nivel, ativo, isDeleted, __new, __editado
5. TURMAS (Turmas) - PK: id, campos: name, instituicao(FK), serie(FK), ano, ativo, __new, __editado
6. MENUS (Menus) - PK: id, campos: title, perfis[], menusItensArray[], ativo, isDeleted, __new, __editado
7. MENU_ITENS (Itens de Menu) - PK: id, campos: title, iconName, path, props, name, perfis[], parentId(FK), isDeleted, __new, __editado
8. VINCULOS (Vínculos) - PK: id, campos: idUsuario(FK), idInstituicao(FK), perfil, idPerfil, ativo, __new, __editado
9. TURMA_PROFESSORES (Turma-Professores) - PK: id, campos: idTurma(FK), idProfessor(FK), role, disciplina, horario, ativo, __new
10. CONFIGURACOES (Configurações) - PK: id, campos: nome, tipo, valor, ativo, __new, __editado
11. ADMIN_LOG (Log de Auditoria) - PK: id, campos: action, entity, entityId, method, endpoint, statusCode, ip, userAgent, requestSnapshot, durationMs, __new

RELACIONAMENTOS:
- USERS (1) --o{ VINCULOS (N) - Um usuário pode ter múltiplos vínculos
- INSTITUICOES (1) --o{ VINCULOS (N) - Uma instituição pode ter múltiplos vínculos
- INSTITUICOES (1) --o{ INSTITUICOES (N) - Hierarquia de instituições (self-referencing)
- INSTITUICOES (1) --o{ TURMAS (N) - Uma instituição pode ter múltiplas turmas
- SERIES (1) --o{ TURMAS (N) - Uma série pode ter múltiplas turmas
- USERS (1) --o{ TURMA_PROFESSORES (N) - Um professor pode estar em múltiplas turmas
- TURMAS (1) --o{ TURMA_PROFESSORES (N) - Uma turma pode ter múltiplos professores
- MENUS (1) --o{ MENU_ITENS (N) - Um menu pode ter múltiplos itens
- MENU_ITENS (1) --o{ MENU_ITENS (N) - Hierarquia de itens de menu (self-referencing)
- USERS (1) --o{ ADMIN_LOG (N) - Um usuário pode gerar múltiplos logs

CARACTERÍSTICAS ESPECIAIS:
- Todas as entidades usam IDs numéricos sequenciais (não ObjectId do MongoDB)
- Sistema de soft delete com campos isDeleted
- Auditoria automática com ADMIN_LOG
- Relacionamentos N:N implementados com tabelas intermediárias
- Campos de timestamp __new (criação) e __editado (modificação)
- Sistema de perfis e permissões hierárquico

Crie um diagrama ER visual com cores diferentes para entidades principais, relacionamentos e campos chave.
```

### Diagrama ER (Entity Relationship)

```mermaid
erDiagram
    USERS {
        number id PK
        string email UK
        string userName UK
        string pass
        string nome
        array perfis
        boolean ativo
        date __new
        date __editado
    }
  
    INSTITUICOES {
        number id PK
        string nome
        string subdominio UK
        number idInstituicaoSuperior FK
        string tipo
        boolean ativo
        date __new
        date __editado
    }
  
    MENUS {
        number id PK
        string title
        array perfis
        array menusItensArray
        boolean ativo
        boolean isDeleted
        date __new
        date __editado
    }
  
    MENU_ITENS {
        number id PK
        string title
        string iconName
        string path
        object props
        string name
        array perfis
        number parentId FK
        boolean isDeleted
        date __new
        date __editado
    }
  
    VINCULOS {
        number id PK
        number idUsuario FK
        number idInstituicao FK
        string perfil
        number idPerfil
        boolean ativo
        date __new
        date __editado
    }
  
    CONFIGURACOES {
        number id PK
        string nome
        string tipo
        object valor
        boolean ativo
        date __new
        date __editado
    }

    PERFIS {
        number id PK
        string nome
        string descricao
        array permissoes
        boolean ativo
        date __new
        date __editado
    }

    SERIES {
        number id PK
        string name
        string nivel
        boolean ativo
        boolean isDeleted
        date __new
        date __editado
    }

    TURMAS {
        number id PK
        string name
        number instituicao FK
        number serie FK
        string ano
        boolean ativo
        date __new
        date __editado
    }

    TURMA_PROFESSORES {
        number id PK
        number idTurma FK
        number idProfessor FK
        string role
        string disciplina
        string horario
        boolean ativo
        date __new
    }

    ADMIN_LOG {
        number id PK
        string action
        string entity
        number entityId
        string method
        string endpoint
        number statusCode
        string ip
        string userAgent
        object requestSnapshot
        number durationMs
        date __new
    }
  
    USERS ||--o{ VINCULOS : "has"
    INSTITUICOES ||--o{ VINCULOS : "has"
    MENUS ||--o{ MENU_ITENS : "contains"
    MENU_ITENS ||--o{ MENU_ITENS : "parent-child"
    INSTITUICOES ||--o{ INSTITUICOES : "hierarchy"
    USERS ||--o{ TURMA_PROFESSORES : "teaches"
    TURMAS ||--o{ TURMA_PROFESSORES : "has"
    INSTITUICOES ||--o{ TURMAS : "contains"
    SERIES ||--o{ TURMAS : "has"
    USERS ||--o{ ADMIN_LOG : "generates"
```

### Fluxograma de Relacionamentos

```mermaid
flowchart TD
    A[Usuário] --> B[Login/Auth]
    B --> C{JWT Válido?}
    C -->|Sim| D[Verificar Perfil]
    C -->|Não| E[Retornar 401]
  
    D --> F[Carregar Menus por Perfil]
    F --> G[Carregar Vínculos do Usuário]
    G --> H[Carregar Instituições]
    H --> I[Retornar Dados]
  
    J[Instituição] --> K[Verificar Hierarquia]
    K --> L[Carregar Instituições Filhas]
    L --> M[Retornar Tree]
  
    N[Menu] --> O[Carregar Itens]
    O --> P[Filtrar por Perfil]
    P --> Q[Construir Hierarquia]
    Q --> R[Retornar Menu]

    S[Turma] --> T[Verificar Instituição]
    T --> U[Verificar Série]
    U --> V[Carregar Professores]
    V --> W[Retornar Turma]

    X[Série] --> Y[Verificar Nível]
    Y --> Z[Carregar Turmas]
    Z --> AA[Retornar Séries]

    BB[Professor] --> CC[Verificar Turmas]
    CC --> DD[Carregar Disciplinas]
    DD --> EE[Retornar Professor]
```

## 🗂️ Entidades

### 1. Users (Usuários)

**Descrição**: Entidade central do sistema que gerencia todos os usuários.

**Campos Principais**:

- `id`: Identificador único (Number)
- `email`: Email do usuário (String, Unique)
- `userName`: Nome de usuário (String, Unique)
- `pass`: Senha hasheada (String)
- `nome`: Nome completo (String)
- `perfis`: Array de perfis/permissões (Array)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🔐 Autenticação com JWT
- 🔑 Hash de senhas com bcrypt
- 👥 controle de perfis

### 2. Instituições

**Descrição**: Representa instituições educacionais com hierarquia.

**Campos Principais**:

- `id`: Identificador único (Number)
- `nome`: Nome da instituição (String)
- `subdominio`: Subdomínio único (String, Unique)
- `idInstituicaoSuperior`: ID da instituição pai (Number, FK)
- `tipo`: Tipo da instituição (String)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🌳 Hierarquia de instituições
- 🔍 Busca por subdomínio
- 📋 Listagem hierárquica

### 3. Menus

**Descrição**: Sistema de menus dinâmicos configuráveis por perfil.

**Campos Principais**:

- `id`: Identificador único (Number)
- `title`: Título do menu (String)
- `perfis`: Perfis que podem acessar (Array)
- `menusItensArray`: Array de itens do menu (Array)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🎯 Filtro por perfil
- 📋 Gestão de itens
- 🔄 Atualização dinâmica

### 4. Menu Itens

**Descrição**: Itens individuais dos menus com hierarquia.

**Campos Principais**:

- `id`: Identificador único (Number)
- `title`: Título do item (String)
- `iconName`: Nome do ícone (String)
- `path`: Caminho/rota (String)
- `props`: Propriedades adicionais (Object)
- `parentId`: ID do item pai (Number, FK)
- `perfis`: Perfis que podem acessar (Array)

**Operações**:

- ✅ CRUD completo
- 🌳 Hierarquia de itens
- 🎯 Filtro por perfil
- 🔗 Relacionamentos

### 5. Vínculos

**Descrição**: Relacionamentos entre usuários e instituições.

**Campos Principais**:

- `id`: Identificador único (Number)
- `idUsuario`: ID do usuário (Number, FK)
- `idInstituicao`: ID da instituição (Number, FK)
- `perfil`: Perfil do usuário na instituição (String)
- `idPerfil`: ID do perfil (Number)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🔗 Relacionamentos N:N
- 👥 Gestão de papéis
- 📊 Relatórios de vínculos

### 6. Configurações

**Descrição**: Sistema flexível de configurações do sistema.

**Campos Principais**:

- `id`: Identificador único (Number)
- `nome`: Nome da configuração (String)
- `tipo`: Tipo da configuração (String)
- `valor`: Valor da configuração (Object)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- ⚙️ Configurações dinâmicas
- 🎨 Cores de menu
- 🔧 Configurações do sistema

### 7. Perfis

**Descrição**: Sistema de perfis e permissões do usuário.

**Campos Principais**:

- `id`: Identificador único (Number)
- `nome`: Nome do perfil (String)
- `descricao`: Descrição do perfil (String)
- `permissoes`: Array de permissões (Array)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🔐 Gestão de permissões
- 👥 Controle de acesso
- 📋 Listagem para selects

### 8. Séries

**Descrição**: Séries/anos escolares do sistema educacional.

**Campos Principais**:

- `id`: Identificador único (Number)
- `name`: Nome da série (String)
- `nivel`: Nível educacional (String)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 📚 Gestão de séries
- 🔗 Associação com turmas
- 📋 Listagem hierárquica

### 9. Turmas

**Descrição**: Turmas de alunos organizadas por série e instituição.

**Campos Principais**:

- `id`: Identificador único (Number)
- `name`: Nome da turma (String)
- `instituicao`: ID da instituição (Number, FK)
- `serie`: ID da série (Number, FK)
- `ano`: Ano letivo (String)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🏫 Gestão de turmas
- 🔗 Associação com instituições e séries
- 👥 Gestão de professores
- 📊 Filtros por status

### 10. Turma-Professores

**Descrição**: Relacionamento N:N entre turmas e professores com atributos específicos.

**Campos Principais**:

- `id`: Identificador único (Number)
- `idTurma`: ID da turma (Number, FK)
- `idProfessor`: ID do professor (Number, FK)
- `role`: Papel do professor (String)
- `disciplina`: Disciplina lecionada (String)
- `horario`: Horário das aulas (String)
- `ativo`: Status ativo/inativo (Boolean)

**Operações**:

- ✅ CRUD completo
- 🔗 Relacionamento N:N
- 👨‍🏫 Gestão de professores por turma
- 📚 Controle de disciplinas
- ⏰ Gestão de horários

### 11. Admin Log (Auditoria)

**Descrição**: Sistema de auditoria para todas as ações administrativas.

**Campos Principais**:

- `id`: Identificador único (Number)
- `action`: Ação realizada (String)
- `entity`: Entidade afetada (String)
- `entityId`: ID da entidade (Number)
- `method`: Método HTTP (String)
- `endpoint`: Endpoint acessado (String)
- `statusCode`: Código de status (Number)
- `ip`: IP do usuário (String)
- `userAgent`: User agent do navegador (String)
- `requestSnapshot`: Snapshot da requisição (Object)
- `durationMs`: Duração da operação (Number)

**Operações**:

- 📝 Log automático de ações
- 🔍 Auditoria completa
- 📊 Relatórios de atividade
- 🛡️ Segurança e compliance

## 🔌 API Endpoints

### Autenticação

Observações gerais:
- Endpoints de leitura e CRUD das entidades requerem JWT. Operações de criação/atualização/exclusão geralmente requerem perfil `admin` via middleware `requireAdmin`.

| Método  | Endpoint                 | Descrição                           |
| ------- | ------------------------ | ----------------------------------- |
| `POST`  | `/auth/login`            | Login do usuário (cookie HttpOnly)  |
| `POST`  | `/auth/logout`           | Logout do usuário                   |
| `GET`   | `/auth/me`               | Dados do usuário autenticado        |
| `PUT`   | `/auth/password`         | Atualizar senha do usuário          |
| `POST`  | `/auth/login/conteudo`   | Login para perfil pedagógico        |

### Usuários

| Método    | Endpoint       | Descrição            |
| ---------- | -------------- | ---------------------- |
| `GET`    | `/users`       | Listar usuários (JWT + admin)       |
| `GET`    | `/users/:id`   | Buscar usuário por ID (JWT + admin) |
| `POST`   | `/users`       | Criar usuário (JWT + admin)         |
| `PUT`    | `/users/:id`   | Atualizar usuário (JWT + admin)     |
| `DELETE` | `/users/:id`   | Deletar usuário (JWT + admin)       |

### Instituições

| Método    | Endpoint              | Descrição                 |
| ---------- | --------------------- | --------------------------- |
| `GET`    | `/instituicoes`       | Listar instituições (JWT)           |
| `GET`    | `/instituicoes/:id`   | Buscar instituição por ID (JWT)     |
| `POST`   | `/instituicoes`       | Criar instituição (JWT + admin)     |
| `PUT`    | `/instituicoes/:id`   | Atualizar instituição (JWT + admin) |
| `DELETE` | `/instituicoes/:id`   | Deletar instituição (JWT + admin)   |

### Menus

| Método    | Endpoint       | Descrição        |
| ---------- | -------------- | ------------------ |
| `GET`    | `/menus`       | Listar menus (JWT + admin)       |
| `GET`    | `/menus/:id`   | Buscar menu por ID (JWT + admin) |
| `POST`   | `/menus`       | Criar menu (JWT + admin)         |
| `PUT`    | `/menus/:id`   | Atualizar menu (JWT + admin)     |
| `DELETE` | `/menus/:id`   | Deletar menu (JWT + admin)       |

### Menu Itens

| Método    | Endpoint            | Descrição            |
| ---------- | ------------------- | ---------------------- |
| `GET`    | `/menu-itens`       | Listar itens de menu (JWT + admin)   |
| `GET`    | `/menu-itens/:id`   | Buscar item por ID (JWT + admin)     |
| `POST`   | `/menu-itens`       | Criar item de menu (JWT + admin)     |
| `PUT`    | `/menu-itens/:id`   | Atualizar item de menu (JWT + admin) |
| `DELETE` | `/menu-itens/:id`   | Deletar item de menu (JWT + admin)   |
| `PATCH`  | `/menu-itens/:id/soft-delete` | Soft delete (JWT + admin) |

### Vínculos

| Método    | Endpoint          | Descrição            |
| ---------- | ----------------- | ---------------------- |
| `GET`    | `/vinculos`       | Listar vínculos (JWT)           |
| `GET`    | `/vinculos/:id`   | Buscar vínculo por ID (JWT)     |
| `POST`   | `/vinculos`       | Criar vínculo (JWT + admin)     |
| `PUT`    | `/vinculos/:id`   | Atualizar vínculo (JWT + admin) |
| `DELETE` | `/vinculos/:id`   | Deletar vínculo (JWT + admin)   |

### Configurações

| Método    | Endpoint         | Descrição                  |
| ---------- | ---------------- | ---------------------------- |
| `GET`    | `/configs`               | Listar configurações (JWT + admin)       |
| `GET`    | `/configs/:id`           | Buscar configuração por ID (JWT + admin) |
| `POST`   | `/configs`               | Criar configuração (JWT + admin)         |
| `PUT`    | `/configs/:id`           | Atualizar configuração (JWT + admin)     |
| `DELETE` | `/configs/:id`           | Deletar configuração (JWT + admin)       |
| `GET`    | `/configs/menu/colors`   | Obter cores do menu (JWT + admin)        |
| `POST`   | `/configs/menu/colors`   | Salvar cores do menu (JWT + admin)       |
| `GET`    | `/configs/perfis`         | Obter lista de perfis (JWT + admin)       |

### Perfis

| Método  | Endpoint      | Descrição                                |
| ------- | ------------- | ---------------------------------------- |
| `GET`   | `/perfis`      | Listar perfis com paginação (JWT + admin) |
| `GET`   | `/perfis/list` | Listar perfis para selects (JWT + admin)  |
| `GET`   | `/perfis/:id`  | Obter perfil por ID (JWT + admin)          |
| `POST`  | `/perfis`      | Criar perfil (JWT + admin)                 |
| `PUT`   | `/perfis/:id`  | Atualizar perfil (JWT + admin)             |
| `DELETE`| `/perfis/:id`  | Deletar perfil (JWT + admin)               |

### Séries

| Método  | Endpoint      | Descrição                                |
| ------- | ------------- | ---------------------------------------- |
| `GET`   | `/series`      | Listar séries com paginação (JWT + admin) |
| `GET`   | `/series/list` | Listar séries para selects (JWT + admin)  |
| `GET`   | `/series/:id`  | Obter série por ID (JWT + admin)          |
| `POST`  | `/series`      | Criar série (JWT + admin)                 |
| `PUT`   | `/series/:id`  | Atualizar série (JWT + admin)             |
| `DELETE`| `/series/:id`  | Deletar série (JWT + admin)               |

### Turmas

| Método  | Endpoint      | Descrição                                |
| ------- | ------------- | ---------------------------------------- |
| `GET`   | `/turmas`      | Listar turmas com paginação e filtros (JWT + admin) |
| `GET`   | `/turmas/list` | Listar turmas para selects (JWT + admin)  |
| `GET`   | `/turmas/:id`  | Obter turma por ID (JWT + admin)          |
| `POST`  | `/turmas`      | Criar turma (JWT + admin)                 |
| `PUT`   | `/turmas/:id`  | Atualizar turma (JWT + admin)             |
| `DELETE`| `/turmas/:id`  | Deletar turma (JWT + admin)               |

### Turma-Professores

| Método  | Endpoint      | Descrição                                |
| ------- | ------------- | ---------------------------------------- |
| `GET`   | `/turma-professores`      | Listar vínculos turma-professor (JWT + admin) |
| `GET`   | `/turma-professores/:id`  | Obter vínculo por ID (JWT + admin)          |
| `POST`  | `/turma-professores`      | Criar vínculo turma-professor (JWT + admin)  |
| `PUT`   | `/turma-professores/:id`  | Atualizar vínculo (JWT + admin)             |
| `DELETE`| `/turma-professores/:id`  | Deletar vínculo (JWT + admin)               |

### Health

| Método  | Endpoint     | Descrição                         |
| ------- | ------------ | --------------------------------- |
| `GET`   | `/health/db` | Verificar conexão com o MongoDB   |

## 🔐 Autenticação

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant D as Database
  
    C->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: User data
    A->>A: Generate JWT
    A-->>C: JWT Token
  
    C->>A: GET /protected-route
    C->>A: Authorization: Bearer <JWT>
    A->>A: Verify JWT
    A-->>C: Protected data
```

### Estratégias de Autenticação

- JWT (JSON Web Token) via Passport.js
- bcryptjs para hash de senhas
- CORS configurado em `app.js` com origens locais padrão

Observações importantes sobre o estado atual do código:
- O secret do **JWT** é lido de `process.env.JWT_SECRET` em `auth.js` e **é obrigatório**.
- A expiração padrão do token é de **7 dias** nas rotas de login.
- A autenticação funciona com **cookie HttpOnly** (rota `/auth/login`) ou com **Authorization: Bearer <token>`** (rota `/auth/login/conteudo`).

### Admin Logs (auditoria)

- Há um **middleware global** que registra ações administrativas na coleção `admin_log`.
- Por padrão, são logadas ações **POST/PUT/PATCH/DELETE** (e GETs caso habilitado via `logGets`).
- Cada log inclui: `action`, `entity`, `entityId`, `method`, `endpoint`, `statusCode`, `ip`, `userAgent`, `requestSnapshot` (limpo de campos sensíveis) e `durationMs`.
- Eventos de **LOGIN/LOGOUT** também podem ser registrados se o *helper* `logAuthEvent` estiver ativo nas rotas de auth.

### Perfis e Permissões

```javascript
// Perfis disponíveis (utilizadas no projeto)
const PERFIS = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  COORDENADOR: 'coordenador',
  PROFESSOR: 'professor',
  ALUNO: 'aluno'
};

// Middleware de autorização
const requirePerfil = (perfil) => {
  return (req, res, next) => {
    if (Array.isArray(req.user.perfis) && req.user.perfis.includes(perfil)) {
      return next();
    }
    return res.status(403).json({ error: 'Acesso negado' });
  };
};
```

## 📁 Estrutura do Projeto

```
backendEducandus/
├── 📁 bin/
│   └── www                    # Entry point da aplicação
├── 📁 controllers/            # Controladores da API
│   ├── userController.js
│   ├── instituicaoController.js
│   ├── menuController.js
│   ├── menuItensController.js
│   ├── vinculoController.js
│   ├── configController.js
│   ├── perfilController.js
│   ├── serieController.js
│   ├── turmaController.js
│   └── turmaProfessorController.js
├── 📁 models/                 # Modelos de dados
│   ├── userModel.js
│   ├── instituicaoModel.js
│   ├── menuModel.js
│   ├── menuItensModel.js
│   ├── vinculoModel.js
│   ├── configModel.js
│   ├── perfilModel.js
│   ├── serieModel.js
│   ├── turmaModel.js
│   ├── turmaProfessorModel.js
│   └── adminLogModel.js
├── 📁 routes/                 # Rotas da API
│   ├── index.js
│   ├── user.js
│   ├── instituicao.js
│   ├── menu.js
│   ├── menuItens.js
│   ├── vinculo.js
│   ├── config.js
│   ├── perfil.js
│   ├── serie.js
│   ├── turma.js
│   ├── turmaProfessor.js
│   └── health.js
├── 📁 middlewares/            # Middlewares customizados
│   ├── requireAdmin.js
│   └── autoAdminLogger.js
├── 📁 utils/                  # Utilitários
│   ├── perfis.js
│   ├── generateTags.js
│   ├── simplify.js
│   └── pagination.js
├── 📁 ressources/             # Arquivos de teste HTTP
├── 📄 app.js                  # Configuração do Express
├── 📄 auth.js                 # Configuração de autenticação
├── 📄 db.js                   # Configuração do MongoDB
├── 📄 package.json            # Dependências e scripts
└── 📄 README.md               # Esta documentação
```

## 🚀 Scripts de Inicialização

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev    # Inicia com nodemon

# Produção
npm start            # Inicia a aplicação

# Inicialização
npm run init         # Inicializa banco e dados padrão
npm run setup        # Cria usuário administrador
npm run create-menu  # Cria menus padrão
```

### Scripts de Configuração

```bash
# Criar usuário admin
node create-admin-user.js

# Criar configurações padrão
node create-default-configs.js

# Criar menus padrão
node create-menu-items.js
```

## 🐳 Deploy

### Docker

```dockerfile
# Dockerfile (alinhado ao projeto)
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 50010
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml (exemplo coerente com o código)
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    container_name: admin-back-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: admin_back
    volumes:
      - mongo_data:/data/db

  backend:
    build: .
    container_name: admin-back-api
    restart: unless-stopped
    ports:
      - "50010:50010"
    environment:
      - STATUS_PROJETO=production
      - MONGO_HOST=mongodb://admin:password@mongodb:27017
      - STATUS_PROJETO=admin_back
      - PORT=50010
      # Observação: JWT_SECRET no .env não é utilizado no código atual
    depends_on:
      - mongodb
    command: node init-and-start.js

volumes:
  mongo_data:
```

### Variáveis de Ambiente para Produção

```env
# Produção (exemplos compatíveis com o código)
STATUS_PROJETO=production
PORT=50010

# Opção B: Host e nome do banco separados
MONGO_HOST=mongodb://admin:password@mongodb:27017
STATUS_PROJETO=admin_back

# Observações:
# - JWT_SECRET existe no .env, mas NÃO é utilizado no código atual (secret está em auth.js)
# - CORS é configurado diretamente em app.js
```

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Commit** suas mudanças
5. **Push** para a branch
6. **Abra** um Pull Request

### Padrões de Código

- **ESLint**: Configuração de linting
- **Prettier**: Formatação de código
- **Conventional Commits**: Padrão de commits
- **JSDoc**: Documentação de funções

### Checklist para Pull Request

- [ ] Código segue os padrões do projeto
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Não quebra funcionalidades existentes
- [ ] Adiciona testes para novas funcionalidades

---

**Desenvolvido com ❤️ pela equipe**

