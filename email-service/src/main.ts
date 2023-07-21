import { NestFactory } from '@nestjs/core';
import { EmailAppModule } from './email-app.module';
import { rabbitMQConfig } from './rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(EmailAppModule);
  app.connectMicroservice(rabbitMQConfig);
  await app.startAllMicroservices();
}
bootstrap();
