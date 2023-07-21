import { NestFactory } from '@nestjs/core';
import { PaymentAppModule } from './payment-app.module';
import { rabbitMQConfig } from './rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(PaymentAppModule);
  app.connectMicroservice(rabbitMQConfig);
  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT || 3001);
}
bootstrap();
