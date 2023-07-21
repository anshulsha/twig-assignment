import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/request/create-payment.dto';
import { PaymentService } from './payment.service';
import { GetPaymentRequestDto } from './dto/request/get-payment.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller('api/v1/payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<HttpException | any> {
    try {
      this.logger.log(
        `--- Payment request: Payment created with ID: --- ${createPaymentDto.order_id}`,
      );
      const payment = await this.paymentService.createPayment(createPaymentDto);

      return { payment_id: payment.payment_id, status: payment.status };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':paymentId')

  async getPayment(@Param(ValidationPipe) params: GetPaymentRequestDto): Promise<HttpException | any> {
    this.logger.log(`--- Get Payment request: --- ${params.paymentId}`);
    try {
      const payment = await this.paymentService.getPaymentById(params.paymentId);
      return payment;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @EventPattern('payment_completed_email_sent')
  async handlerPaymentCompletedEmailSent(payment_id: string) {
    await this.paymentService.paymentCompletedEmailSent(payment_id);
  }

  @EventPattern('payment_created_email_sent')
  async handlerPaymentCreatedEmailSent(payment_id: string) {
    await this.paymentService.paymentCreatedEmailSent(payment_id);
  }
  
}
