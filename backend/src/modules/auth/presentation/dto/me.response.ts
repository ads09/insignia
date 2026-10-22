import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../users/domain/user.js';

export class MeResponse {
  @ApiProperty({ example: 'abcd' })
  username: string;

  @ApiProperty({ enum: Object.values(Role), example: Role.USER })
  role: Role;
}
