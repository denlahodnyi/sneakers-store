import { Module } from '@nestjs/common';

import { UsersController } from './users.controller.js';
import { AccountsController } from './accounts.controller.js';
import { SessionsController } from './sessions.controller.js';

@Module({
  controllers: [UsersController, AccountsController, SessionsController],
})
export class UsersModule {}
