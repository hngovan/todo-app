import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { UsersService } from '@/users/users.service'
import { User } from '@/users/entities/user.entity'

// best-practice: security-auth-jwt
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('messages.error.invalid_credentials')

    const isValid = await this.usersService.validatePassword(user, password)
    if (!isValid) throw new UnauthorizedException('messages.error.invalid_credentials')

    return user
  }
}
