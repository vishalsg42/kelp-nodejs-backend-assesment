import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { v4 as uuidv4 } from 'uuid';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: any, host: ArgumentsHost): Promise<any> {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    if (exception.status === 500) {
      this.logger.error(exception);
    } else {
      this.logger.error(exception.response);
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const error =
      exception instanceof HttpException
        ? exception.name
        : 'Internal server error';

    const event = `${req.method}_${req.route?.path}`;

    const responseBody: any = {
      errorException: error,
      exception: exception.name,
      uuid: uuidv4(),
      message: exception?.response?.message
        ? exception?.response?.message
        : exception.message,
      event,
      status: httpStatus,
      timestamp: new Date(),
    };

    if (httpStatus == 500) {
      const meta = {
        url: req.url,
        query: req.query,
        body: req.body,
        user: req.user,
        stack: exception?.stack,
        exception: exception.name,
      };
      this.logger.error({ message: exception.toString(), meta });
    } else {
      this.logger.error(exception.toString(), exception.stack);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
