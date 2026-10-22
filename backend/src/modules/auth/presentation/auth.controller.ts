import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import type { AuthenticatedUser } from '../domain/authenticated-user.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { MeResponse } from './dto/me.response.js';
import { TokenResponse } from './dto/token.response.js';

@ApiTags('Auth (extension)')
@Controller()
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Exchange username and password for a user token.',
  })
  @ApiOkResponse({ type: TokenResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Current user',
    description: 'Profile of the token owner.',
  })
  @ApiOkResponse({ type: MeResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  me(@CurrentUser() user: AuthenticatedUser): MeResponse {
    return { username: user.username, role: user.role };
  }
}
