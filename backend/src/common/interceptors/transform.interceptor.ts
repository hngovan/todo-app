import { Injectable, NestInterceptor, ExecutionContext, CallHandler, StreamableFile } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// best-practice: api-use-interceptors
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T> | StreamableFile> {
    const response = context.switchToHttp().getResponse<{ statusCode: number }>()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data: T) => {
        if (data instanceof StreamableFile) {
          return data
        }
        return {
          statusCode,
          message: 'Success',
          data
        }
      })
    )
  }
}
