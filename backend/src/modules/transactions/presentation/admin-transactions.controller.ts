import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/decorators/roles.decorator.js';
import { Role } from '../../users/domain/user.js';
import { ListAllTransactionsUseCase } from '../application/use-cases/list-all-transactions.use-case.js';
import { AdminTransactionListQuery } from './dto/admin-transaction-list.query.js';
import { LedgerTransactionPageResponse } from './dto/transaction.responses.js';

@ApiTags('Admin (extension)')
@ApiSecurity('token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Administrator role required' })
@Roles(Role.ADMIN)
@Controller('admin/transactions')
export class AdminTransactionsController {
  constructor(
    private readonly listAllTransactions: ListAllTransactionsUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all transactions',
    description:
      'Paginated list of the transactions of every user, with search, filters and sorting.',
  })
  @ApiOkResponse({ type: LedgerTransactionPageResponse })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async list(
    @Query() query: AdminTransactionListQuery,
  ): Promise<LedgerTransactionPageResponse> {
    const page = await this.listAllTransactions.execute(query.toQuery());
    return LedgerTransactionPageResponse.from(page);
  }
}
