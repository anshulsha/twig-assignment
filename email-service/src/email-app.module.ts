import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/config/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailAppModule {}
