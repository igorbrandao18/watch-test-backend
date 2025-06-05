# Guia de Teste dos Endpoints - WatchMe

## Acessando a Documentação Swagger

1. Inicie o servidor:
```bash
npm run start:dev
```

2. Acesse a documentação Swagger:
```
http://localhost:3000/api
```

## Testando os Endpoints

### 1. Registro de Usuário
1. No Swagger UI, expanda a seção `auth`
2. Clique no endpoint `POST /auth/register`
3. Clique em "Try it out"
4. Insira o JSON de exemplo:
```json
{
  "email": "teste@exemplo.com",
  "password": "senha123"
}
```
5. Clique em "Execute"

### 2. Login
1. Use o endpoint `POST /auth/login`
2. Use as mesmas credenciais do registro:
```json
{
  "email": "teste@exemplo.com",
  "password": "senha123"
}
```
3. Copie o `access_token` da resposta

### 3. Autorizando Requisições
1. No topo da página Swagger, clique no botão "Authorize"
2. Cole o token no campo "Value" com o prefixo "Bearer":
```
Bearer seu_token_aqui
```
3. Clique em "Authorize"

### 4. Testando Endpoints de Filmes

#### Listar Filmes Populares
1. Expanda a seção `movies`
2. Use o endpoint `GET /movies/popular`
3. Clique em "Try it out" e "Execute"

#### Detalhes de um Filme
1. Use o endpoint `GET /movies/{id}`
2. Insira um ID de filme (ex: 550 para Fight Club)
3. Execute a requisição

#### Histórico de Visualizações
1. Use o endpoint `GET /movies/views`
2. Execute para ver seu histórico

## Testando via cURL

### Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com", "password": "senha123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com", "password": "senha123"}'
```

### Filmes Populares (com token)
```bash
curl http://localhost:3000/movies/popular \
  -H "Authorization: Bearer seu_token_aqui"
```

### Detalhes do Filme
```bash
curl http://localhost:3000/movies/550 \
  -H "Authorization: Bearer seu_token_aqui"
```

### Histórico de Visualizações
```bash
curl http://localhost:3000/movies/views \
  -H "Authorization: Bearer seu_token_aqui"
```

## Observabilidade

Cada requisição retorna headers com informações de tracing:
- `X-Trace-Id`: ID único do trace
- `X-Span-Id`: ID do span atual

Exemplo de resposta com tracing:
```json
{
  "context": "TracingInterceptor",
  "level": "info",
  "method": "POST",
  "ms": "+53ms",
  "responseTime": 53,
  "span_id": "6e74450eb1c9f2f9",
  "status": "success",
  "trace_id": "f10bb2cb4b74b0759b4e0a422cf8e5f9"
}
```

## Códigos de Status

- 200: Sucesso
- 201: Criado com sucesso
- 400: Requisição inválida
- 401: Não autorizado
- 404: Não encontrado
- 500: Erro interno 