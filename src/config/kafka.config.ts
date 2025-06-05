import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      clientId: process.env.KAFKA_CLIENT_ID || 'watchme-service',
    },
    consumer: {
      groupId: process.env.KAFKA_GROUP_ID || 'watchme-consumer-group',
    },
    producer: {
      allowAutoTopicCreation: true,
    },
  },
};