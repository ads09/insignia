import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { trim } from '../../../../shared/presentation/transforms.js';

export class TransferDto {
  @ApiProperty({ example: 'username' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  to_username: string;

  @ApiProperty({ example: 100, minimum: 0, exclusiveMinimum: true })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  amount: number;
}
