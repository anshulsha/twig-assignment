import { IsNotEmpty, IsString } from 'class-validator';

export class GetOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
