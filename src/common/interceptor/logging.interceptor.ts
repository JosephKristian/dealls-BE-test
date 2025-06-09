import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl, headers, body: requestBody } = req;
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const user = req.user as { id?: string };
    const userId = user?.id ?? 'system';
    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - startTime;

        const log = {
          method,
          url: originalUrl,
          userId,
          ip,
          userAgent,
          request: {
            headers,
            body: requestBody,
          },
          response: {
            statusCode: res.statusCode,
            body: responseBody,
          },
          duration: `${duration}ms`,
        };

        console.log('[SUCCESS]', JSON.stringify(log, null, 2));
      }),
      catchError((err) => {
        const duration = Date.now() - startTime;

        const statusCode =
          typeof err.getStatus === 'function'
            ? err.getStatus()
            : err.status || 500;

        const errorLog = {
          method,
          url: originalUrl,
          userId,
          ip,
          userAgent,
          request: {
            headers,
            body: requestBody,
          },
          response: {
            statusCode,
            error: err?.message || err,
            detail: err?.response || null,
          },
          duration: `${duration}ms`,
        };

        console.error('[ERROR]', JSON.stringify(errorLog, null, 2));

        return throwError(() => err);
      })
    );
  }
}
