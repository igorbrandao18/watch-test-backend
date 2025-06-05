# WatchMe - Cinema Online

## Sobre o Projeto
Sistema de catálogo de filmes online com autenticação, integração com TMDb API e recursos de visualização de filmes.

## Tecnologias Principais
- NestJS (Backend Framework)
- PostgreSQL (Database)
- Prisma (ORM)
- Redis (Cache)
- JWT (Autenticação)
- TMDb API (Dados dos Filmes)
- OpenTelemetry (Observabilidade)

## Pré-requisitos
- Node.js >= 18
- Docker e Docker Compose
- PostgreSQL
- Redis

## Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/watchme?schema=public"
TMDB_API_URL="https://api.themoviedb.org/3"
TMDB_API_KEY="sua_chave_api"
JWT_SECRET="seu_jwt_secret"
REDIS_URL="redis://localhost:6379"
```

## Instalação e Setup

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd watch-test-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

4. Execute as migrações do banco:
```bash
npx prisma migrate deploy
```

5. Inicie o servidor:
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Endpoints da API

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login de usuário

### Filmes
- `GET /movies/popular` - Lista filmes populares
- `GET /movies/:id` - Detalhes de um filme
- `GET /movies/views` - Histórico de visualizações

### Saúde da Aplicação
- `GET /health` - Status da aplicação

## Testes

### Testes Unitários
```bash
npm run test
```

### Testes E2E
```bash
npm run test:e2e
```

### Testes de Carga
```bash
npm run test:k6
```

## Observabilidade

O sistema utiliza OpenTelemetry para tracing distribuído, com logs estruturados incluindo:
- trace_id
- span_id
- Métricas de latência
- Status de requisições

## Cache

O sistema implementa estratégia de cache com Redis para:
- Filmes populares (TTL: 5 minutos)
- Detalhes de filmes (TTL: 5 minutos)

## Documentação da API
A documentação Swagger está disponível em `/api` quando o servidor está rodando.

## Contribuição
1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request