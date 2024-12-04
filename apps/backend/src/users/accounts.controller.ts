import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { AccountCreateDto, contract as c } from '@sneakers-store/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { accountsTable } from '../db/schemas/user.schema.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';

@Controller('accounts')
export class AccountsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @TsRestHandler(c.accounts.createAccount)
  async createAccount(
    @Body(ConfiguredValidationPipe) createAccountDto: AccountCreateDto,
  ) {
    return tsRestHandler(c.accounts.createAccount, async () => {
      const [account] = await this.drizzleService.db
        .insert(accountsTable)
        .values(createAccountDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { account } } };
    });
  }

  @Delete(':provider/:providerAccountId')
  @TsRestHandler(c.accounts.deleteAccount)
  async deleteAccount(
    @Param() params: { provider: string; providerAccountId: string },
  ) {
    return tsRestHandler(c.accounts.deleteAccount, async () => {
      const { provider, providerAccountId } = params;
      const [account = null] = await this.drizzleService.db
        .delete(accountsTable)
        .where(
          and(
            eq(accountsTable.provider, provider),
            eq(accountsTable.providerAccountId, providerAccountId),
          ),
        )
        .returning();
      return { status: 200, body: { status: 'success', data: { account } } };
    });
  }
}
