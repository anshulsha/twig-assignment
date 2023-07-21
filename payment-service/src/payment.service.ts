import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import { EventPattern } from '@nestjs/microservices';
import { PaymentStatus } from './common/enum/payment-status.enum';
import { GetPaymentRequestDto } from './dto/request/get-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  private readonly emailService = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}:${process.env.RMQ_PORT}`,
      ],
      queue: process.env.EMAIL_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });

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

  async createPayment(paymentData: any): Promise<HttpException | any> {
    try {
      const { email, amount, type, order_id } = paymentData;

      // Save the payment to the database
      const payment = new this.paymentModel({
        email,
        amount,
        type,
        status: PaymentStatus.CREATED,
        payment_email_sent: false,
      });

      await payment.save();

      // sending event to order service to update payment initiated status
      this.orderService.emit('payment_initiated', paymentData.order_id);

      // Send event to Email Service
      this.logger.log(
        `--- Payment created. Sending event to Email Service. ---`,
      );
      this.emailService.emit('payment_created', {
        email,
        amount,
        type,
        order_id,
        payment_id: payment._id,
      });

      // Process the payment (payment gateway integration logic here)
      this.logger.log(
        `--- Processing payment for Payment ID: --- ${payment._id}`,
      );

      // Simulating payment processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      await payment.save();

      // Send event to Email Service
      this.logger.log(
        `--- Payment completed. Sending event to Email Service. ---`,
      );
      this.emailService.emit('payment_completed', {
        email,
        amount,
        type,
        order_id,
        payment_id: payment._id,
      });
      this.orderService.emit('payment_completed', {
        email,
        amount,
        type,
        order_id,
        payment_id: payment._id,
      });

      return { payment_id: payment._id, status: payment.status };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPaymentById(paymentId: string): Promise<any> {
    try {
      this.logger.log(
        `--- Entered in handler to get payment details from paymentId: --- payload: ${JSON.stringify(
          { paymentId },
        )}`,
      );
      return await this.paymentModel.findById(paymentId).exec();
    } catch (e) {
      this.logger.error(
        `--- Error occured in handler to get payment details from paymentId: --- payload: ${JSON.stringify(
          { paymentId },
        )}`,
      );
      throw new HttpException(
        'No payment found with the given id.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @EventPattern('order_created')
  async handlePaymentCreated(paymentData: any) {
    try {
      this.logger.log(
        `--- Received event: Payment created with ID: --- ${paymentData._id}`,
      );

      const payment = await this.paymentModel.findById(paymentData._id).exec();
      // Update the payment properties based on the event data
      payment.status = PaymentStatus.CREATED;
      await payment.save();

      this.logger.log(`--- Payment updated with ID: --- ${paymentData._id}`);
    } catch (error) {
      this.logger.error(
        `--- Order created event handler failed --- ${error.message}`,
      );
    }
  }

  @EventPattern('payment_completed')
  async handlePaymentComplete(paymentData: any) {
    try {
      this.logger.log(
        `--- Received event: Payment created with ID: --- ${paymentData._id}`,
      );

      // Save the updated payment to the database
      const payment = await this.paymentModel.findById(paymentData._id).exec();
      // Update the payment properties based on the event data
      payment.status = PaymentStatus.CREATED;
      await payment.save();

      this.logger.log(`--- Payment updated with ID: --- ${paymentData._id}`);
    } catch (error) {
      this.logger.error(
        `--- Payment complete event handler failed --- ${error.message}`,
      );
    }
  }

  async paymentCompletedEmailSent(payment_id: string) {
    try {
      const payment = await this.paymentModel.findById(payment_id).exec();

      payment.payment_email_sent = true;

      await payment.save();
    } catch (error) {}
  }

  async paymentCreatedEmailSent(payment_id: string) {
    try {
      const payment = await this.paymentModel.findById(payment_id);
      // Update the payment properties based on the event data
      payment.status = PaymentStatus.CREATED;
      await payment.save();
    } catch (error) {}
  }
}
