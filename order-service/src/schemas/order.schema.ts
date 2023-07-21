import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderStatus } from 'src/common/enum/order-status.enum';

@Schema()
export class Order extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  type: string;

  @Prop()
  payment_id?: string;

  @Prop({ default: OrderStatus.CREATED })
  status: OrderStatus;

  @Prop({ default: false })
  order_email_sent: boolean;

  @Prop({ default: false })
  payment_email_sent: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
