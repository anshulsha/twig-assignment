import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';

@Schema()
export class Payment extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  type: string;

  @Prop({ default: PaymentStatus.CREATED })
  status?: PaymentStatus;

  @Prop({ default: false })
  payment_email_sent?: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
