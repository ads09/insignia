import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TopUpDto {
  @ApiProperty({
    example: 1000,
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 10_000_000,
    exclusiveMaximum: true,
    description: 'Positive amount lower than 10000000.',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  amount: number;
}
