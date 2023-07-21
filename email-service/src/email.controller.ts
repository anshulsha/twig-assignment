import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { PaymentCompleteEventDto } from './dto/request/payment-complete.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @EventPattern('order_created')
  async handleOrderCreated(orderData: any) {
    this.emailService.OrderCreated(orderData);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(paymentData: PaymentCompleteEventDto) {
    this.emailService.PaymentCompleted(paymentData);
  }

  @EventPattern('payment_created')
  async handlePaymentCreated(paymentData: PaymentCompleteEventDto) {
    this.emailService.handlePaymentCreated(paymentData);
  }
}
