import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';
import { AppLogger } from 'src/common/services/logger.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import envConfig from 'src/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      envFilePath: envConfig().envFilePath,
    }),
    UserModule,
  ],
  controllers: [],
  providers: [AppLogger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
