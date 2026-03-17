import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { apiErr, CoreSystemException, matchError, SystemException } from '@workspace/backend-core';
import { ApiErrors } from '@workspace/contract';

type GlobalSystemException = CoreSystemException;

@Catch(SystemException)
export class SystemExceptionFilter implements ExceptionFilter<SystemException> {
  private readonly logger = new Logger(SystemExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: GlobalSystemException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    try {
      const response = matchError(exception, {
        InternalServerError: (err) => {
          this.logger.error(
            {
              msg: `Internal server error: ${err.details?.error?.code}`,
              error: err,
            },
            exception?.stack,
          );
          return apiErr(ApiErrors.InternalServerError);
        },
        UnexpectedDomainError: (err) => {
          this.logger.error(
            {
              msg: `Unexpected domain error: ${err.details?.error?.code}`,
              error: err,
            },
            exception?.stack,
          );
          return apiErr(ApiErrors.UnexpectedDomainError);
        },
        InvariantViolation: (err) => {
          this.logger.error(
            {
              msg: `Invariant violation: ${err.message}`,
              error: err,
            },
            exception?.stack,
          );
          return apiErr(ApiErrors.InternalServerError, {});
        },
        CacheInfrastructureError: (err) => {
          this.logger.error(
            {
              msg: `Cache infrastructure error: ${err.details?.key}`,
              error: err,
            },
            exception?.stack,
            JSON.stringify(err.details?.originalError),
          );
          return apiErr(ApiErrors.InternalServerError);
        },
        InvalidAggregationStatusChange: (err) => {
          this.logger.warn(
            {
              msg: `Invalid aggregation status change from ${err.details?.from} to ${err.details?.to}`,
              error: err,
            },
            exception?.stack,
          );
          return apiErr(ApiErrors.InternalServerError);
        },
      });

      // 4. 응답 전송
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    } catch {
      this.logger.error(
        {
          msg: `Unhandled domain error: ${exception.code}`,
          error: exception,
        },
        exception?.stack,
        JSON.stringify(exception),
      );
      const response = apiErr(ApiErrors.UnhandledDomainError, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
