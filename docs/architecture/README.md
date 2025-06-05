# Documentação de Arquitetura - WatchMe

## Visão Geral
O WatchMe é uma aplicação de catálogo de filmes que integra com a API do TMDb para fornecer informações atualizadas sobre filmes. A aplicação é construída usando uma arquitetura moderna, distribuída e escalável.

## Componentes Principais

### Backend (NestJS)
- **API Gateway**: Ponto de entrada principal para todas as requisições
- **Serviços**:
  - AuthService: Gerenciamento de autenticação e autorização
  - MoviesService: Integração com TMDb e gerenciamento de filmes
  - CacheService: Gerenciamento de cache com Redis
- **Banco de Dados**: PostgreSQL para persistência de dados
- **Cache**: Redis para caching de respostas da API do TMDb

### Infraestrutura (AWS)
- **Computação**: ECS Fargate para containers
- **Banco de Dados**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Rede**: VPC com subnets públicas e privadas
- **Segurança**: Security Groups e IAM Roles

## Diagramas
- [Arquitetura Geral](./diagrams/architecture.png)
- [Fluxo de Autenticação](./diagrams/auth-flow.png)
- [Fluxo de Dados](./diagrams/data-flow.png)
- [ERD](./diagrams/erd.png)

## Fluxos Principais

### Autenticação
1. Cliente envia credenciais
2. Sistema valida e gera JWT
3. Token é usado para requisições subsequentes

### Listagem de Filmes
1. Cliente solicita lista de filmes
2. Sistema verifica cache
3. Se não encontrado, busca na API do TMDb
4. Armazena em cache
5. Retorna para o cliente

### Detalhes do Filme
1. Cliente solicita detalhes de um filme
2. Sistema verifica cache
3. Se não encontrado, busca na API do TMDb
4. Armazena em cache
5. Retorna para o cliente

## Decisões de Arquitetura

### Cache
- Utilização de Redis para melhorar performance
- TTL de 5 minutos para dados de filmes
- Estratégia de cache-aside

### Segurança
- JWT para autenticação
- Senhas hasheadas com bcrypt
- HTTPS em todas as comunicações
- Secrets gerenciados via AWS Secrets Manager

### Escalabilidade
- Arquitetura stateless
- Load balancing com ALB
- Auto-scaling baseado em métricas de CPU/Memória 