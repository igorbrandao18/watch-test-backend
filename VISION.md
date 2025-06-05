# WatchMe - Cinema Online (Backend)

## Visão Geral
API para sistema de catálogo de filmes online com autenticação e integração TMDb.

## Stack Técnica
- Fastify
- PostgreSQL + Prisma
- Redis (cache)
- OpenTelemetry
- Docker
- AWS Lambda/ECS
- Terraform
- GitHub Actions

## Funcionalidades Core

### 1. Autenticação
- Login com email/senha
- JWT para autenticação
- Logs estruturados

### 2. Filmes
- Lista de filmes populares (TMDb)
- Detalhes do filme
- Cache em Redis

## Entidades

### User
- id
- email
- password (hash)
- created_at
- updated_at

### Movie (via TMDb)
- id
- title
- overview
- poster_path
- release_date
- vote_average

## Requisitos Técnicos

### Observabilidade
- OpenTelemetry + Jaeger
- Logs estruturados
- Métricas básicas

### Testes
- Unitários (Jest)
- Integração
- Carga (K6)

### Documentação
- OpenAPI/Swagger
- ERD (banco de dados)
- Diagramas de arquitetura
- Documentação de setup

### Infraestrutura
- IaC com Terraform
- CI/CD via GitHub Actions
- Containerização
- Versionamento de schema

## Fluxo Principal
1. Login → JWT
2. Lista filmes (cache)
3. Detalhes filme 