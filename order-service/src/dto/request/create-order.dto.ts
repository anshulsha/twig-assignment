import { IsNotEmpty, IsEnum, IsNumber, IsEmail } from 'class-validator';
import { OrderType } from 'src/common/enum/order-type.enum';

export class CreateOrderRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;
}
