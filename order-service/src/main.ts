import { NestFactory } from '@nestjs/core';
import { OrderAppModule } from './order-app.module';
import { rabbitMQConfig } from './rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(OrderAppModule);
  app.connectMicroservice(rabbitMQConfig);
  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
