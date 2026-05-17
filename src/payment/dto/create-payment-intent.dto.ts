import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be at least $0.01' })
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}
