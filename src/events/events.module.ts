import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { kafkaConfig } from '../config/kafka.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        ...kafkaConfig,
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {} 