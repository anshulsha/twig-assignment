import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Order } from './schemas/order.schema';
import { HttpService } from '@nestjs/axios';
import { OrderStatus } from './common/enum/order-status.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetOrderRequestDto } from './dto/request/get-order.dto';
import { CreateOrderRequestDto } from './dto/request/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Order.name) private orderModel: Model<Order>,
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

  async createOrder(
    orderData: CreateOrderRequestDto,
  ): Promise<HttpException | Order> {
    try {
      this.logger.log(
        `--- Entered in handler to create new order --- payload: ${JSON.stringify(
          orderData,
        )}`,
      );
      const { email, amount, type } = orderData;

      // Save the order to the database
      const order = new this.orderModel({
        email,
        amount,
        type,
        status: OrderStatus.CREATED,
        order_email_sent: false,
        payment_email_sent: false,
      });

      const order_instance = await order.save();

      // Send event to Email Service
      this.logger.log(`--- Order created. Sending event to Email Service. ---`);
      await new Promise((resolve) => setTimeout(resolve, 7000));
      this.emailService.emit('order_created', order_instance);

      // Send API call to Payment Service
      this.logger.log(
        `--- Initiating payment for Order ID: --- ${order_instance._id}`,
      );
      const payment_response = await this.httpService
        .post(`${process.env.PAYMENT_SERVICE_BASE_URL}/create`, {
          order_id: order_instance._id,
          email,
          amount,
          type,
        })
        .toPromise();

      if (payment_response) {
        // Update order with payment_id and status
        order_instance.payment_id = payment_response.data.payment_id;
        order_instance.status = OrderStatus.PAYMENT_INITIATED;
      }

      const updated_response = await order_instance.save();

      return updated_response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrderById(orderId: string): Promise<any> {
    try {
      this.logger.log(
        `--- Entered in handler to get order details from orderId: --- payload: ${JSON.stringify(
          { orderId },
        )}`,
      );
      return await this.orderModel.findById(orderId).exec();
    } catch (e) {
      this.logger.error(
        `--- Error occured in handler to get payment details from paymentId: --- payload: ${JSON.stringify(
          { orderId },
        )}`,
      );

      throw new HttpException(
        'No payment found with the given id.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateOrderStatus(
    payload: GetOrderRequestDto,
    status: OrderStatus,
  ): Promise<HttpException | Order> {
    try {
      this.logger.log(
        `--- Entered in handler to update order status --- payload: ${JSON.stringify(
          { orderId: payload.orderId, status: status },
        )}`,
      );
      const order = await this.getOrderById(payload.orderId);
      order.status = status;
      return order.save();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async paymentCompleted(paymentData) {
    try {
      this.logger.log(`--- Received event: Payment completed with ID: ---`);

      console.log(paymentData);

      // update payment details in order
      const order = await this.orderModel.findById(paymentData.order_id);

      order.payment_id = paymentData.payment_id;
      order.status = OrderStatus.COMPLETED;
      await order.save();

      this.logger.log(
        `--- Order has with payment details with order ID: --- ${paymentData.order_id}`,
      );
    } catch (error) {
      this.logger.error(
        `--- Error occured in payment complete event handler --- ${error.message}`,
      );
    }
  }

  async paymentInitiated(order_id: string) {
    const order = await this.orderModel.findById(order_id).exec();
    order.status = OrderStatus.PAYMENT_INITIATED;
    await order.save();
  }

  async orderCreatedEmailSent(order_id: string) {
    const order = await this.orderModel.findById(order_id).exec();
    // setting email send flag after order creation
    order.order_email_sent = true;
    await order.save();
  }

  async paymentCompletedEmailSen(order_id: string) {
    const order = await this.orderModel.findById(order_id).exec();
    order.payment_email_sent = true;
    await order.save();
  }
}
