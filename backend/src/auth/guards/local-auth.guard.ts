import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

// best-practice: security-use-guards
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
