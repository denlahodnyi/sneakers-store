import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import {
  UserSignInDto,
  UserCreateDto,
  UserUpdateDto,
  contract as c,
} from '@sneakers-store/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { accountsTable, Role, usersTable } from '../db/schemas/user.schema.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthConditions } from '../auth/auth-conditions.decorator.js';

const SALT_ROUNDS = 10;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...omitPassword } = getTableColumns(usersTable);
const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('users')
export class UsersController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @TsRestHandler(c.users.createUser)
  async createUser(
    @Body(ConfiguredValidationPipe)
    createUserDto: UserCreateDto,
  ) {
    return tsRestHandler(c.users.createUser, async () => {
      let hashedPassword = null;
      if (createUserDto.password) {
        hashedPassword = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
      }
      const [user] = await this.drizzleService.db
        .insert(usersTable)
        .values({ ...instanceToPlain(createUserDto), password: hashedPassword })
        .returning(omitPassword);
      return { status: 201, body: { status: 'success', data: { user } } };
    });
  }

  @HttpCode(200)
  @Post('signin')
  @TsRestHandler(c.users.signIn)
  async signIn(@Body(ConfiguredValidationPipe) signInDto: UserSignInDto) {
    return tsRestHandler(c.users.signIn, async () => {
      const [user = null] = await this.drizzleService.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, signInDto.email));

      if (!user) {
        throw new NotFoundException(
          'The user with the provided email is not found',
        );
      }
      if (signInDto.asAdmin && !adminRoles.includes(user.role as string)) {
        throw new ForbiddenException('Sorry, you have no access rights');
      }
      if (!user.password) {
        throw new BadRequestException(
          'Current user cannot sign-in with credentials. Please use another method',
        );
      }

      const match = await bcrypt.compare(signInDto.password, user.password);

      if (!match) {
        throw new BadRequestException("Password doesn't match");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return { status: 200, body: { status: 'success', data: { user: rest } } };
    });
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  @AuthConditions((user) => [
    { params: { userId: user.id } },
    { roles: adminRoles },
  ])
  @TsRestHandler(c.users.getUser)
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return tsRestHandler(c.users.getUser, async () => {
      const [user = null] = await this.drizzleService.db
        .select(omitPassword)
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      return { status: 200, body: { status: 'success', data: { user } } };
    });
  }

  @Patch(':userId')
  @UseGuards(AuthGuard)
  @AuthConditions((user) => [
    { params: { userId: user.id } },
    { roles: adminRoles },
  ])
  @TsRestHandler(c.users.updateUser)
  async updateUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body(ConfiguredValidationPipe) updateUserDto: UserUpdateDto,
  ) {
    return tsRestHandler(c.users.updateUser, async () => {
      const [user] = await this.drizzleService.db
        .update(usersTable)
        .set(updateUserDto)
        .where(eq(usersTable.id, userId))
        .returning(omitPassword);

      if (!user) {
        throw new NotFoundException("User doesn't exist");
      }

      return { status: 200, body: { status: 'success', data: { user } } };
    });
  }

  @Get()
  @TsRestHandler(c.users.getUserByAccountOrEmail)
  async getUserByAccountOrEmail(
    @Query('providerAccountId') providerAccountId: string,
    @Query('provider') provider: string,
    @Query('email') email: string,
  ) {
    return tsRestHandler(c.users.getUserByAccountOrEmail, async () => {
      if (email) {
        const [user = null] = await this.drizzleService.db
          .select(omitPassword)
          .from(usersTable)
          .where(eq(usersTable.email, email));
        return { status: 200, body: { status: 'success', data: { user } } };
      }
      if (provider && providerAccountId) {
        // https://github.com/nextauthjs/next-auth/issues/8377#issuecomment-1704299629
        const [user = null] = await this.drizzleService.db
          .select(omitPassword)
          .from(usersTable)
          .leftJoin(accountsTable, eq(usersTable.id, accountsTable.userId))
          .where(
            and(
              eq(accountsTable.provider, provider),
              eq(accountsTable.providerAccountId, providerAccountId),
            ),
          );
        return { status: 200, body: { status: 'success', data: { user } } };
      }
      return { status: 200, body: { status: 'success', data: { user: null } } };
    });
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @AuthConditions((user) => [
    { params: { userId: user.id } },
    { roles: adminRoles },
  ])
  @TsRestHandler(c.users.deleteUser)
  async deleteUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return tsRestHandler(c.users.deleteUser, async () => {
      const [user = null] = await this.drizzleService.db
        .delete(usersTable)
        .where(eq(usersTable.id, userId))
        .returning(omitPassword);
      return { status: 200, body: { status: 'success', data: { user } } };
    });
  }
}
