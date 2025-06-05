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
GET /movies/popular
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 550,
    "title": "Fight Club",
    "overview": "Um homem deprimido que sofre de insônia...",
    "poster_path": "/poster.jpg",
    "release_date": "1999-10-15",
    "vote_average": 8.4
  }
]
```

### Detalhes do Filme
```http
GET /movies/{id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "Um homem deprimido que sofre de insônia...",
  "poster_path": "/poster.jpg",
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

### Histórico de Visualizações
```http
GET /movies/views
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "movieId": "550",
    "userId": "user-uuid",
    "viewedAt": "2024-03-14T10:30:00Z"
  }
]
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado - Token JWT inválido ou ausente |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Cache

- Filmes populares: cache de 5 minutos
- Detalhes do filme: cache de 5 minutos
- Cache implementado com Redis

## Observabilidade

Todas as requisições incluem:
- `trace_id`: ID único do trace
- `span_id`: ID do span atual
- Métricas de latência
- Status da requisição

## Segurança

- Todas as senhas são hasheadas antes de armazenadas
- Tokens JWT com expiração de 24 horas
- HTTPS obrigatório em produção
- Headers de segurança padrão ativados 