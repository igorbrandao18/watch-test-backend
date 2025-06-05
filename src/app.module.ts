import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './logging/logging.module';
import { EventsModule } from './events/events.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    }),
    LoggingModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    HealthModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {} 