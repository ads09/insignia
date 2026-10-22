import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { GetTopTransactionsForUserUseCase } from '../application/use-cases/get-top-transactions-for-user.use-case.js';
import { GetTopUsersUseCase } from '../application/use-cases/get-top-users.use-case.js';
import { ListUserTransactionsUseCase } from '../application/use-cases/list-user-transactions.use-case.js';
import {
  TopTransactionResponse,
  TopUserResponse,
  UserTransactionPageResponse,
} from './dto/transaction.responses.js';
import { UserTransactionListQuery } from './dto/user-transaction-list.query.js';

@ApiTags('Transactions')
@ApiSecurity('token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller()
export class TransactionsController {
  constructor(
    private readonly getTopTransactions: GetTopTransactionsForUserUseCase,
    private readonly getTopUsers: GetTopUsersUseCase,
    private readonly listUserTransactions: ListUserTransactionsUseCase,
  ) {}

  @Get('top_transactions_per_user')
  @ApiOperation({
    summary: 'Top transactions for user',
    description:
      'Top 10 transfers of the user by absolute value, credits and debits, sorted descending. Debits are negative. Empty list when the user has no transactions.',
  })
  @ApiOkResponse({ type: [TopTransactionResponse], description: 'Success' })
  async topTransactionsPerUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TopTransactionResponse[]> {
    const transactions = await this.getTopTransactions.execute(user.id);
    return transactions.map((item) => TopTransactionResponse.from(item));
  }

  @Get('top_users')
  @ApiOperation({
    summary: 'List overall top transacting users by value',
    description:
      'Top 10 users by the total aggregated value of their outbound transfers (debits).',
  })
  @ApiOkResponse({ type: [TopUserResponse], description: 'Top users' })
  async topUsers(): Promise<TopUserResponse[]> {
    const users = await this.getTopUsers.execute();
    return users.map((item) => TopUserResponse.from(item));
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'List my transactions (extension)',
    description:
      "Paginated list of the current user's transactions (credits, debits and top-ups) with search, filters and sorting.",
  })
  @ApiOkResponse({ type: UserTransactionPageResponse })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UserTransactionListQuery,
  ): Promise<UserTransactionPageResponse> {
    const page = await this.listUserTransactions.execute(
      user.id,
      query.toQuery(),
    );
    return UserTransactionPageResponse.from(page);
  }
}
