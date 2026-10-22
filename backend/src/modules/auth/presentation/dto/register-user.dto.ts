import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trim } from '../../../../shared/presentation/transforms.js';

export const PASSWORD_MIN_LENGTH = 8;

export class RegisterUserDto {
  @ApiProperty({ example: 'abcd' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiPropertyOptional({
    description:
      'Extension: required to sign in to the dashboard via POST /login.',
    minLength: PASSWORD_MIN_LENGTH,
    example: 'secret123',
  })
  @IsOptional()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(72) // bcrypt only uses the first 72 bytes
  password?: string;
}
