# Arquitetura do Sistema - WatchMe

## Visão Geral da Arquitetura

```mermaid
graph TD
    Client[Cliente HTTP] --> API[API Gateway/NestJS]
    API --> Auth[Módulo Auth]
    API --> Movies[Módulo Movies]
    API --> Health[Módulo Health]
    API --> Events[Módulo Events]
    
    Auth --> JWT[JWT Service]
    Auth --> Users[Users Service]
    Movies --> TMDb[TMDb API]
    Movies --> Cache[Redis Cache]
    Movies --> Events
    
    Events --> Kafka[Apache Kafka]
    
    subgraph Database
        PostgreSQL[(PostgreSQL)]
    end
    
    subgraph Observability
        Logs[Logs Estruturados]
        Traces[OpenTelemetry]
        Metrics[Métricas]
        Kafka --> Analytics[Analytics]
    end
    
    Users --> PostgreSQL
    Movies --> PostgreSQL
    API --> Observability
```

## Componentes Principais

### 1. API Gateway (NestJS)
- Gerenciamento de rotas
- Middleware de autenticação
- Interceptors para logging e tracing
- Validação de requisições
- Tratamento de erros

### 2. Módulos

#### Auth Module
- Registro de usuários
- Autenticação via JWT
- Gerenciamento de sessão
- Hash de senhas

#### Movies Module
- Integração com TMDb API
- Cache de resultados
- Tracking de visualizações
- Gerenciamento de estado
- Publicação de eventos

#### Events Module
- Integração com Kafka
- Publicação de eventos
- Processamento assíncrono
- Rastreamento de ações

#### Health Module
- Healthcheck dos serviços
- Monitoramento de dependências
- Status da aplicação

### 3. Serviços de Infraestrutura

#### Cache (Redis)
- Cache de filmes populares
- Cache de detalhes de filmes
- TTL configurável
- Invalidação automática

#### Message Broker (Kafka)
- Tópicos de eventos
- Processamento assíncrono
- Rastreamento de ações
- Analytics em tempo real

#### Database (PostgreSQL)
- Persistência de dados
- Migrations automáticas
- Índices otimizados
- Backup automático

### 4. Observabilidade

#### Logging
- Logs estruturados em JSON
- Contexto de requisição
- Níveis de log configuráveis
- Rotação de logs

#### Tracing (OpenTelemetry)
- Trace ID em todas requisições
- Spans para operações importantes
- Métricas de latência
- Contexto distribuído

## Fluxos Principais

### 1. Autenticação
```mermaid
sequenceDiagram
    Client->>+API: POST /auth/login
    API->>+Users: Validate Credentials
    Users->>+PostgreSQL: Query User
    PostgreSQL-->>-Users: User Data
    Users->>+JWT: Generate Token
    JWT-->>-Users: JWT Token
    Users-->>-API: Auth Response
    API-->>-Client: JWT Token
```

### 2. Visualização de Filme
```mermaid
sequenceDiagram
    Client->>+API: GET /movies/{id}
    API->>+Cache: Check Cache
    alt Cache Hit
        Cache-->>API: Cached Data
    else Cache Miss
        API->>+TMDb: Fetch Movie
        TMDb-->>-API: Movie Data
        API->>Cache: Store in Cache
    end
    API->>+Events: Publish MovieViewed
    Events->>Kafka: Emit Event
    API-->>-Client: Movie Details
```

### 3. Processamento de Eventos
```mermaid
sequenceDiagram
    participant API
    participant Events
    participant Kafka
    participant Analytics
    
    API->>+Events: Publish Event
    Events->>+Kafka: Emit Event
    Kafka-->>-Events: Ack
    Events-->>-API: Success
    
    Kafka->>+Analytics: Process Event
    Analytics->>Analytics: Update Metrics
    Analytics-->>-Kafka: Processed
```

## Considerações de Segurança

1. **Autenticação**
   - JWT com expiração
   - Refresh tokens
   - Rate limiting

2. **Dados**
   - Senhas hasheadas
   - HTTPS
   - Validação de entrada

3. **Cache**
   - TTL definido
   - Invalidação manual
   - Chaves únicas

4. **Eventos**
   - Validação de payload
   - Retry policies
   - Dead letter queues

## Escalabilidade

1. **Horizontal**
   - Stateless design
   - Cache distribuído
   - Load balancing
   - Kafka partitioning

2. **Vertical**
   - Query optimization
   - Connection pooling
   - Resource limits
   - Batch processing 