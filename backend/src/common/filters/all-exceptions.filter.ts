import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { I18nContext } from 'nestjs-i18n'

// best-practice: error-use-exception-filters
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const i18n = I18nContext.current()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      const originalMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (((exceptionResponse as Record<string, unknown>).message as string | string[]) ?? exception.message)

      if (Array.isArray(originalMessage)) {
        message = originalMessage // I18nValidationPipe output
      } else if (typeof originalMessage === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message = i18n ? i18n.t(originalMessage as any, { defaultValue: originalMessage }) : originalMessage
      } else {
        message = String(originalMessage)
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error on ${request.method} ${request.url}`, exception.stack)
    }

    response.status(status).json({
      statusCode: status,
      message,
      data: null
    })
  }
}
