import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

// best-practice: security-use-guards
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
