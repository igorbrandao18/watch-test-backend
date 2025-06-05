import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    EventsModule,
  ],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {} 