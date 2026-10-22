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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { GetBalanceUseCase } from '../application/use-cases/get-balance.use-case.js';
import { TopUpUseCase } from '../application/use-cases/top-up.use-case.js';
import { TransferUseCase } from '../application/use-cases/transfer.use-case.js';
import { BalanceResponse } from './dto/balance.response.js';
import { TopUpDto } from './dto/top-up.dto.js';
import { TransferDto } from './dto/transfer.dto.js';

@ApiTags('Wallet')
@ApiSecurity('token')
@ApiUnauthorizedResponse({ description: 'User token not valid' })
@Controller()
export class WalletController {
  constructor(
    private readonly topUpUseCase: TopUpUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase,
    private readonly transferUseCase: TransferUseCase,
  ) {}

  @Post('topup')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Balance topup',
    description:
      'Topup the crypto wallet balance of current user based on token. Only positive topup amounts and values < 10000000 are to be allowed.',
  })
  @ApiNoContentResponse({ description: 'Topup successful' })
  @ApiBadRequestResponse({ description: 'Invalid topup amount' })
  topUp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TopUpDto,
  ): Promise<void> {
    return this.topUpUseCase.execute({ userId: user.id, amount: dto.amount });
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Balance read',
    description: 'Fetch the current balance based on user token',
  })
  @ApiOkResponse({ type: BalanceResponse, description: 'Balance read success' })
  getBalance(@CurrentUser() user: AuthenticatedUser): Promise<BalanceResponse> {
    return this.getBalanceUseCase.execute(user.id);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Transfer',
    description:
      'Transfer balance from one user to another. Wallet balance to be always >= 0. The balance is deducted from the token owner and added to the user identified by "to_username".',
  })
  @ApiNoContentResponse({ description: 'Transfer success' })
  @ApiBadRequestResponse({ description: 'Insufficient balance' })
  @ApiNotFoundResponse({ description: 'Destination user not found' })
  transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TransferDto,
  ): Promise<void> {
    return this.transferUseCase.execute({
      sender: user,
      toUsername: dto.to_username,
      amount: dto.amount,
    });
  }
}
