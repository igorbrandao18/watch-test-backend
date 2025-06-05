Objetivo:
Desenvolver uma aplicação full stack com frontend e backend, garantindo documentação
completa (incluindo além do README), com suporte a autenticação, persistência de dados e
observabilidade/telemetria.
A aplicação deve ser construída utilizando Node.js, com abstrações como NestJS, Next.js e
Vue.js, seguindo uma arquitetura distribuída e implantada em um ambiente serverless. O
sistema deve integrar-se a mensageria (ex.: Kafka, SQS) e APIs externas/internas, garantindo
alta escalabilidade, resiliência e monitoramento eficiente.

Caso de uso
Sinta-se a vontade para escolher. Mas se usar streaming, ficaremos empolgados!

Requisitos

Frontend (Vue.js)
Desenvolvimento de interfaces dinâmicas e responsivas utilizando Vue.js com
Tailwind CSS, Material UI (Vuetify) ou ShadCN-Vue para uma experiência
moderna e acessível.
Gerenciamento de estado com Pinia ou Vuex, conforme a necessidade do
projeto.
Integração com APIs RESTful e suporte a WebSockets para comunicação em
tempo real.
Implementação de componentes reutilizáveis e modulares, seguindo
padrões de design escaláveis.
Suporte à autenticação e controle de acesso, integrando-se com JWT ou
OAuth.
Otimização de performance com Lazy Loading, Code Splitting e Server-Side
Rendering (Nuxt.js).
Internacionalização (i18n) e suporte a temas dinâmicos para uma melhor
experiência do usuário.

Frontend (Vue.js)
Desenvolvimento de interfaces dinâmicas e responsivas utilizando Vue.js com
Tailwind CSS, Material UI (Vuetify) ou ShadCN-Vue para uma experiência
moderna e acessível.
Gerenciamento de estado com Pinia ou Vuex, conforme a necessidade do
projeto.
Integração com APIs RESTful e suporte a WebSockets para comunicação em
tempo real.
Implementação de componentes reutilizáveis e modulares, seguindo
padrões de design escaláveis.
Suporte à autenticação e controle de acesso, integrando-se com JWT ou
OAuth.
Otimização de performance com Lazy Loading, Code Splitting e Server-Side
Rendering (Nuxt.js).
Internacionalização (i18n) e suporte a temas dinâmicos para uma melhor
experiência do usuário.

Backend (Node.js)
Implementar API RESTful utilizando Node.js e Fastfy.
Criar endpoints CRUD para manipular os dados de uma entidade específica
(por exemplo, usuários ou produtos).
Utilizar ORM (qual você desejar) para interação com um banco de dados
relacional (PostgreSQL ou MySQL).
Implementar autenticação via JWT para proteger os endpoints.
Adicionar logs estruturados para facilitar a rastreabilidade.

Observabilidade
Instrumentação do código com OpenTelemetry e integração com Jaeger,
Grafada ou datadog para rastreamento de requisições.
Implementação de logs, métricas e tracing distribuído para monitoramento
da API.

Testes
Criar testes unitários com Jest.
Cobrir casos de sucesso e erro, incluindo validações e regras de negócio.
Testes de integração simulando chamadas à API.
Testes de carga utilizando K6

Infraestrutura e Deploy
Implementação e Deploy: Desenvolvimento da API em ambiente serverless
utilizando AWS Lambda ou containerizada com ECS + Fargate, garantindo
escalabilidade e alta disponibilidade.
Provisionamento de Infraestrutura: Automação da infraestrutura com
Terraform ou AWS CDK, seguindo práticas de Infrastructure as Code (IaC).
CI/CD: Integração e entrega contínua utilizando GitHub Actions, GitLab CI/CD
ou AWS CodePipeline, com pipelines automatizados para build, testes e
deploy.
Arquitetura
Usar arquitetura distribuída com baixo acoplamento e alta coesão
Aplicar mensageria ( Kafka, SQS, etc) em trechos da aplicação.

Dica
Cuide dos detalhes e exponha em sua documentação.

Aviso
Levamos muito a sério documentação e processo, portanto, capriche.

Documentação
Criar um README detalhado com instruções de execução e uso da API.
Desenvolver documentação arquitetural utilizando draw.io ( para arquitetura) e
Structurizr DSL ou UML para diagramas de fluxo.
Gerar documentação dos endpoints usando padrão OpenAPI
Base de Dados
Criar ERD para todos os bancos
Aplicar controle de versão de schema ( desejável)
Usar Cache em algum momento da aplicação para melhorar desempenho

GitHub é uma ótima opção para subir sua aplicação e compartilhar conosco.