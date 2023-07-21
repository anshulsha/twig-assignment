import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { OrderType } from 'src/common/enum/order-type.enum';

export class PaymentCompleteEventDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;

  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  payment_id: string;
}
