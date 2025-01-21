import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';
import { AppLogger } from 'src/common/services/logger.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppLogger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
