import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from '../cache/cache.module';
import { EventsModule } from '../events/events.module';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RedisCacheModule,
    EventsModule,
  ],
  providers: [MoviesService, PrismaService],
  controllers: [MoviesController],
})
export class MoviesModule {} 