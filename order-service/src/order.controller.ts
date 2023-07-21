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
import { OrderService } from './order.service';
import { CreateOrderRequestDto } from './dto/request/create-order.dto';
import { EventPattern } from '@nestjs/microservices';
import { GetOrderRequestDto } from './dto/request/get-order.dto';
import { Order } from './schemas/order.schema';

@Controller('api/v1/order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(
    @Body() payload: CreateOrderRequestDto,
  ): Promise<HttpException | Order> {
    try {
      const order = await this.orderService.createOrder(payload);
      return order as Order;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':orderId')
  async getOrder(
    @Param(ValidationPipe) params: GetOrderRequestDto,
  ): Promise<HttpException | Order> {
    try {
      const order = await this.orderService.getOrderById(params.orderId);
      return order as Order;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(paymentData) {
    await this.orderService.paymentCompleted(paymentData);
  }

  @EventPattern('payment_initiated')
  async handlePaymentInitiate(order_id: string) {
    await this.orderService.paymentInitiated(order_id);
  }

  @EventPattern('order_created_email_sent')
  async handlerOrderCreatedEmailSent(order_id: string) {
    await this.orderService.orderCreatedEmailSent(order_id);
  }

  @EventPattern('payment_completed_email_sent')
  async handlerPaymentCompletedEmailSent(order_id: string) {
    await this.orderService.paymentCompletedEmailSen(order_id);
  }
}
