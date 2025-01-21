import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('process-csv')
  async processCsv(): Promise<string> {
    await this.userService.processCsvFromConfig();
    return 'CSV processed and data uploaded successfully!';
  }
}
