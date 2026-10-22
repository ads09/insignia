import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponse {
  @ApiProperty({ example: 1000 })
  balance: number;
}
