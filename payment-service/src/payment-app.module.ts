import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentSchema } from './schemas/payment.schema';
import { PaymentService } from './payment.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/config/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `${process.env.DB_TYPE}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ),
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class PaymentAppModule {}
