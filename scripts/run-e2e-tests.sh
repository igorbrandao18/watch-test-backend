#!/bin/bash

# Verifica se o arquivo .env.test existe
if [ ! -f .env.test ]; then
  echo "Arquivo .env.test não encontrado. Por favor, crie o arquivo com as configurações de teste."
  exit 1
fi

# Carrega as variáveis de ambiente de teste
export $(cat .env.test | grep -v '^#' | xargs)

# Executa o Prisma migrate para o banco de dados de teste
echo "Aplicando migrations no banco de dados de teste..."
npx prisma migrate deploy

# Limpa o cache do Jest
echo "Limpando cache do Jest..."
npx jest --clearCache

# Executa os testes E2E
echo "Executando testes E2E..."
npm run test:e2e

# Retorna o código de saída dos testes
exit $? 