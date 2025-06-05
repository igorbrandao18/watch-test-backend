# WatchMe API

API para sistema de catálogo de filmes online com autenticação e integração TMDb.

## Stack Técnica

- NestJS
- PostgreSQL + Prisma
- Redis (cache)
- OpenTelemetry + Jaeger
- Docker + AWS ECS/Fargate
- Terraform para IaC
- AWS SQS para mensageria
- GitHub Actions para CI/CD
- Jest + K6

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta no TMDb para API Key
- Conta AWS com credenciais configuradas

## Configuração

1. Clone o repositório
2. Copie o arquivo `.env.example` para `.env` e configure as variáveis:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/watchme?schema=public
   JWT_SECRET=your-super-secret-key-here
   REDIS_HOST=localhost
   REDIS_PORT=6379
   TMDB_API_KEY=your-tmdb-api-key-here
   TMDB_API_URL=https://api.themoviedb.org/3
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie os serviços com Docker:
   ```bash
   docker-compose up -d
   ```

5. Execute as migrações do banco:
   ```bash
   npx prisma migrate dev
   ```

## Desenvolvimento

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm run test          # Testes unitários
npm run test:e2e     # Testes de integração
npm run test:cov     # Cobertura de testes

# Testes de Carga
k6 run k6/movies.js
```

## Endpoints

### Autenticação
- POST `/auth/login` - Login de usuário
  - Body: `{ "email": "string", "password": "string" }`

### Usuários
- POST `/users` - Criar usuário
  - Body: `{ "email": "string", "password": "string" }`
- GET `/users/:id` - Buscar usuário por ID (requer autenticação)

### Filmes
- GET `/movies/popular` - Listar filmes populares (requer autenticação)
- GET `/movies/:id` - Buscar detalhes de um filme (requer autenticação)

## Documentação API

A documentação completa da API está disponível em:
- Swagger UI: http://localhost:3000/api
- OpenAPI JSON: http://localhost:3000/api-json

## Arquitetura

A documentação da arquitetura está disponível em:
- Diagramas C4: `docs/architecture.dsl`
- Diagrama de Componentes: [Link para draw.io]

### Componentes Principais
- NestJS API (ECS Fargate)
- PostgreSQL RDS
- Redis ElastiCache
- AWS SQS para eventos
- OpenTelemetry + Jaeger

## Observabilidade

- Jaeger UI: http://localhost:16686
- Logs: CloudWatch Logs
- Métricas: CloudWatch Metrics via OpenTelemetry

## Infraestrutura

A infraestrutura é gerenciada com Terraform:
- ECS Fargate para a API
- RDS para PostgreSQL
- ElastiCache para Redis
- SQS para mensageria
- ECR para imagens Docker

### Deploy

O deploy é automatizado via GitHub Actions:
1. Testes (unitários e integração)
2. Build da imagem Docker
3. Push para ECR
4. Deploy via Terraform

## Estrutura do Projeto

```
src/
├── auth/           # Autenticação JWT
├── users/          # Gerenciamento de usuários
├── movies/         # Integração TMDb
└── common/         # Utilitários compartilhados
test/               # Testes de integração
k6/                 # Testes de carga
terraform/          # Infraestrutura como código
.github/            # GitHub Actions
docs/               # Documentação
```

## Banco de Dados

### Modelo ERD
```
User {
  id        String   [pk]
  email     String   [unique]
  password  String
  createdAt DateTime
  updatedAt DateTime
}
```

## Cache

- Redis é usado para cache de:
  - Lista de filmes populares (30 minutos)
  - Detalhes do filme (1 hora)

## Mensageria

Eventos publicados no SQS:
- UserCreated
- UserLoggedIn
- MovieViewed

## Testes

- Unitários: `src/**/*.spec.ts`
- Integração: `test/`
- Carga: `k6/`
- Cobertura mínima: 80%