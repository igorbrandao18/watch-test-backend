import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TracingInterceptor.name);

  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<any> {
    const request = executionContext.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    const currentSpan = trace.getSpan(context.active());
    const traceId = currentSpan?.spanContext().traceId;

    this.logger.log({
      type: 'request',
      method,
      url,
      traceId,
    });

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const responseTime = Date.now() - now;
          this.logger.log({
            type: 'response',
            method,
            url,
            traceId,
            responseTime,
            status: 'success',
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - now;
          this.logger.error({
            type: 'response',
            method,
            url,
            traceId,
            responseTime,
            status: 'error',
            error: error.message,
          });
        },
      }),
    );
  }
} 