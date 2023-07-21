import { Transport } from '@nestjs/microservices';

export const rabbitMQConfig: any = {
  transport: Transport.RMQ,
  options: {
    urls: [
      `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`,
    ],
    queue: process.env.RMQ_QUEUE,
    queueOptions: {
      durable: false,
    },
  },
};
