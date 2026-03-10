import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@/users/entities/user.entity'

// best-practice: di-prefer-constructor-injection
export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<{ user: User }>()
  return request.user
})
