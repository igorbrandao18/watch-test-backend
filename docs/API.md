# Documentação da API - WatchMe

## Base URL
`http://localhost:3000`

## Autenticação

### Registro de Usuário
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2024-03-14T10:00:00Z"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Filmes

Todas as rotas de filmes requerem autenticação via Bearer Token.

### Listar Filmes Populares
```http
GET /movies/popular?language=pt-BR
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 550,
    "title": "Fight Club",
    "overview": "Um homem deprimido que sofre de insônia...",
    "poster_path": "https://image.tmdb.org/t/p/w500/poster.jpg",
    "release_date": "1999-10-15",
    "vote_average": 8.4
  }
]
```

### Detalhes do Filme
```http
GET /movies/{id}?language=pt-BR
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "Um homem deprimido que sofre de insônia...",
  "poster_path": "https://image.tmdb.org/t/p/w500/poster.jpg",
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  "genres": [
    {
      "id": 18,
      "name": "Drama"
    }
  ],
  "runtime": 139,
  "budget": 63000000,
  "revenue": 101200000
}
```

### Buscar Filmes
```http
GET /movies/search?query=fight+club&language=pt-BR
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 550,
    "title": "Fight Club",
    "overview": "Um homem deprimido que sofre de insônia...",
    "poster_path": "https://image.tmdb.org/t/p/w500/poster.jpg",
    "release_date": "1999-10-15",
    "vote_average": 8.4
  }
]
```

## Eventos

A API gera eventos assíncronos via Kafka para certas ações.

### MovieViewed Event
Gerado quando um usuário visualiza detalhes de um filme.

**Tópico:** `movie.viewed`

**Formato:**
```json
{
  "userId": 123,
  "movieId": 550,
  "timestamp": "2024-03-14T10:30:00Z",
  "language": "pt-BR"
}
```

### UserAction Event
Gerado para ações significativas do usuário.

**Tópico:** `user.action`

**Formato:**
```json
{
  "userId": 123,
  "action": "search",
  "resource": "movies",
  "resourceId": null,
  "timestamp": "2024-03-14T10:30:00Z",
  "metadata": {
    "query": "fight club",
    "language": "pt-BR"
  }
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado - Token JWT inválido ou ausente |
| 404 | Recurso não encontrado |
| 429 | Limite de requisições excedido |
| 500 | Erro interno do servidor |

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Cache

- Filmes populares: cache de 5 minutos
- Detalhes do filme: cache de 5 minutos
- Resultados de busca: cache de 5 minutos
- Cache implementado com Redis

## Observabilidade

Todas as requisições incluem:
- `trace_id`: ID único do trace
- `span_id`: ID do span atual
- Métricas de latência
- Status da requisição
- Eventos Kafka para análise assíncrona

## Segurança

- Todas as senhas são hasheadas antes de armazenadas
- Tokens JWT com expiração de 24 horas
- HTTPS obrigatório em produção
- Headers de segurança padrão ativados
- Validação de payload em eventos Kafka 