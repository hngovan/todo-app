import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

export interface UpdateProfileDto {
  name?: string
  oldPassword?: string
  newPassword?: string
}

// best-practice: arch-use-repository-pattern, arch-single-responsibility
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    })
    if (existing) {
      throw new ConflictException('messages.error.email_in_use')
    }

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(createUserDto.password, salt)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashed
    })
    return this.userRepository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('messages.error.user_not_found')
    return user
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'password' | 'todos'>> {
    const user = await this.findById(userId)

    if (dto.name) {
      user.name = dto.name
    }

    if (dto.newPassword) {
      if (!dto.oldPassword) {
        throw new BadRequestException('messages.error.old_password_required')
      }
      const valid = await bcrypt.compare(dto.oldPassword, user.password)
      if (!valid) throw new BadRequestException('messages.error.password_incorrect')
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(dto.newPassword, salt)
    }

    const saved = await this.userRepository.save(user)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, todos, ...profile } = saved
    return profile
  }

  async updateAvatar(userId: string, filename: string): Promise<Omit<User, 'password' | 'todos'>> {
    const user = await this.findById(userId)
    user.avatarUrl = filename
    const saved = await this.userRepository.save(user)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, todos, ...profile } = saved
    return profile
  }

  async setCurrentRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = await this.findById(userId)
    if (refreshToken) {
      const salt = await bcrypt.genSalt(10)
      user.currentRefreshToken = await bcrypt.hash(refreshToken, salt)
    } else {
      user.currentRefreshToken = null
    }
    await this.userRepository.save(user)
  }
}
