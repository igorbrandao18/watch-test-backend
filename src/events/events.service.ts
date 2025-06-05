import { Injectable, Logger } from '@nestjs/common';
import { SQS } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventsService {
  private sqs: SQS | null = null;
  private readonly queueUrl: string | null = null;
  private readonly logger = new Logger(EventsService.name);
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDev = process.env.NODE_ENV !== 'production';
    const queueUrl = this.configService.get<string>('SQS_QUEUE_URL');
    
    if (!this.isDev && !queueUrl) {
      throw new Error('SQS_QUEUE_URL must be defined in production environment');
    }

    if (queueUrl) {
      this.queueUrl = queueUrl;
      this.sqs = new SQS({
        region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      });
    }
  }

  async publishEvent(eventType: string, payload: any): Promise<void> {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      payload,
    };

    if (this.isDev) {
      this.logger.debug(`[Event Published] ${JSON.stringify(event)}`);
      return;
    }

    if (!this.sqs || !this.queueUrl) {
      throw new Error('SQS is not configured');
    }

    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(event),
    };

    try {
      await this.sqs.sendMessage(params).promise();
    } catch (error) {
      this.logger.error('Failed to publish event to SQS:', error);
      throw error;
    }
  }

  async publishUserCreated(userId: string, email: string): Promise<void> {
    await this.publishEvent('UserCreated', { userId, email });
  }

  async publishUserLoggedIn(userId: string): Promise<void> {
    await this.publishEvent('UserLoggedIn', { userId });
  }

  async publishMovieViewed(userId: string, movieId: string): Promise<void> {
    await this.publishEvent('MovieViewed', { userId, movieId });
  }
} 