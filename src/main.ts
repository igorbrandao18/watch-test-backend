import sdk from './tracing';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TracingInterceptor } from './common/tracing.interceptor';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  // Inicializa o OpenTelemetry
  await sdk.start();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  // Configura o logger global
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Adiciona o interceptor de tracing
  app.useGlobalInterceptors(new TracingInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('WatchMe API')
    .setDescription('API para o sistema de catálogo de filmes WatchMe')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('users', 'Endpoints de usuários')
    .addTag('movies', 'Endpoints de filmes')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configurações globais
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Registra o shutdown do OpenTelemetry
  const shutdown = async () => {
    await app.close();
    await sdk.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap(); 