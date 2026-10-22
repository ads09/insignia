import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case.js';
import { Public } from './decorators/public.decorator.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { TokenResponse } from './dto/token.response.js';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly registerUser: RegisterUserUseCase) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Register user',
    description:
      'Register a new user by username. Username is to be unique for every user.',
  })
  @ApiCreatedResponse({
    type: TokenResponse,
    description: "User's details including authentication token",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Username already exists' })
  register(@Body() dto: RegisterUserDto): Promise<TokenResponse> {
    return this.registerUser.execute(dto);
  }
}
