import { Injectable, Logger } from '@nestjs/common';
import { PaymentCompleteEventDto } from './dto/request/payment-complete.dto';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name);

  constructor() {}
  private readonly orderService = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`,
      ],
      queue: process.env.ORDER_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });

  private readonly paymentService = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`,
      ],
      queue: process.env.PAYMENT_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });
  async OrderCreated(orderData: any) {
    try {
      this.logger.log(
        `--- Received event: Order created with ID: --- ${orderData._id}`,
      );

      // Send email for order creation

      // sending event for email sent

      this.orderService.emit('order_created_email_sent', orderData._id);

      this.logger.log(
        `--- Email sent for order creation with ID: --- ${orderData._id}`,
      );
    } catch (error) {
      this.logger.error(
        `--- Email order event creation handler failed --- ${error.message}`,
      );
    }
  }

  async PaymentCompleted(paymentData: PaymentCompleteEventDto) {
    try {
      this.logger.log(
        `--- Received event: Payment completed with ID: --- ${paymentData.payment_id}, ${paymentData.order_id}`,
      );

      // Send email for payment completion

      // sending event to payment service to update flag for payment complete event sent
      this.paymentService.emit(
        'payment_completed_email_sent',
        paymentData.payment_id,
      );

      // sending event to order service to update flag for payment complete event sent
      this.orderService.emit(
        'payment_completed_email_sent',
        paymentData.order_id,
      );
      this.logger.log(
        `--- Email sent for payment completion with ID: --- ${paymentData.payment_id}`,
      );
    } catch (error) {
      this.logger.error(
        `--- Email payment complete event handler failed --- ${error.message}`,
      );
    }
  }

  async handlePaymentCreated(paymentData: PaymentCompleteEventDto) {
    try {
      this.logger.log(
        `--- Received event: Payment created with ID: --- ${paymentData.payment_id}`,
      );

      this.paymentService.emit(
        'payment_created_email_sent',
        paymentData.payment_id,
      );

      this.logger.log(
        `--- Payment updated with ID: --- ${paymentData.payment_id}`,
      );
    } catch (error) {
      this.logger.error(
        `--- Email payment created event handler failed --- ${error.message}`,
      );
    }
  }
}
