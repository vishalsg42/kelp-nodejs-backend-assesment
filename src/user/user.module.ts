import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppLogger } from 'src/common/services/logger.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AppLogger],
})
export class UserModule {}
