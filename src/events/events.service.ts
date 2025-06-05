import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export enum EventTopics {
  MOVIE_VIEWED = 'movie.viewed',
  USER_ACTION = 'user.action',
}

export interface MovieViewedEvent {
  userId: number;
  movieId: number;
  timestamp: Date;
  language: string;
}

export interface UserActionEvent {
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Conectar aos tópicos
    const topics = Object.values(EventTopics);
    topics.forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
    });
    await this.kafkaClient.connect();
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
  }

  async publishMovieViewed(event: MovieViewedEvent): Promise<void> {
    try {
      await this.kafkaClient.emit(EventTopics.MOVIE_VIEWED, event);
      this.logger.log(`Movie viewed event published: Movie ${event.movieId} by User ${event.userId}`);
    } catch (error) {
      this.logger.error('Failed to publish movie viewed event', error);
      throw error;
    }
  }

  async publishUserAction(event: UserActionEvent): Promise<void> {
    try {
      await this.kafkaClient.emit(EventTopics.USER_ACTION, event);
      this.logger.log(`User action event published: ${event.action} by User ${event.userId}`);
    } catch (error) {
      this.logger.error('Failed to publish user action event', error);
      throw error;
    }
  }
} 