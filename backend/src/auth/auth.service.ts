import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '@/users/users.service'
import { User } from '@/users/entities/user.entity'
import { RegisterDto } from './dto/register.dto'

export interface AuthPayload {
  user: Omit<User, 'password' | 'todos'>
  access_token: string
  refresh_token: string
}

// best-practice: arch-single-responsibility
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const user = await this.usersService.create(dto)
    return this.buildPayload(user)
  }

  login(user: User): AuthPayload {
    return this.buildPayload(user)
  }

  getProfile(user: User): Omit<User, 'password' | 'todos'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, todos, ...profile } = user
    return profile
  }

  async refreshTokens(refreshToken: string): Promise<AuthPayload> {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      })
      const user = await this.usersService.findById(payload.sub)
      if (!user) throw new UnauthorizedException('messages.error.user_not_found')
      return this.buildPayload(user)
    } catch {
      throw new UnauthorizedException('messages.error.invalid_token')
    }
  }

  private buildPayload(user: User): AuthPayload {
    const { password, todos, ...profile } = user
    void password
    void todos
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email
    })
    const refresh_token = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as unknown as number
      }
    )
    return { user: profile, access_token, refresh_token }
  }
}
