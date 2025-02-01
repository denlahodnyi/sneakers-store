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
import { and, eq, getTableColumns, sql, type SQL } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import {
  UserSignInDto,
  UserCreateDto,
  UserUpdateDto,
  contract as c,
  UserQueryDto,
} from '@sneakers-store/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  accountsTable,
  ADMIN_ROLES,
  usersTable,
} from '../db/schemas/user.schema.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthConditions } from '../auth/auth-conditions.decorator.js';
import createPaginationDto from '../shared/libs/pagination/createPaginationDto.js';

const SALT_ROUNDS = 10;
const LIMIT = 10;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...omitPassword } = getTableColumns(usersTable);

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
      if (signInDto.asAdmin && !ADMIN_ROLES.includes(user.role as string)) {
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
    { roles: ADMIN_ROLES },
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
    { roles: ADMIN_ROLES },
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
  @TsRestHandler(c.users.getUsers)
  async getUsers(@Query(ConfiguredValidationPipe) query: UserQueryDto) {
    return tsRestHandler(c.users.getUsers, async () => {
      const { email, provider, providerAccountId, perPage = LIMIT } = query;
      const page = query.page || 1;
      const filters: SQL[] = [];

      if (email) {
        filters.push(eq(usersTable.email, email));
      }

      let usersQuery = this.drizzleService.db
        .select({
          ...omitPassword,
          total: sql<number>`COUNT(*) OVER()`.mapWith(Number).as('total'),
        })
        .from(usersTable)
        .where(and(...filters))
        .offset((page - 1) * perPage)
        .limit(perPage)
        .$dynamic();

      if (provider && providerAccountId) {
        // https://github.com/nextauthjs/next-auth/issues/8377#issuecomment-1704299629
        usersQuery = usersQuery
          .leftJoin(accountsTable, eq(usersTable.id, accountsTable.userId))
          .where(
            and(
              eq(accountsTable.provider, provider),
              eq(accountsTable.providerAccountId, providerAccountId),
            ),
          );
      }
      const users = await usersQuery;
      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            users,
            pagination: createPaginationDto({
              total: users[0]?.total || 0,
              page,
              perPage,
            }),
          },
        },
      };
    });
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @AuthConditions((user) => [
    { params: { userId: user.id } },
    { roles: ADMIN_ROLES },
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
