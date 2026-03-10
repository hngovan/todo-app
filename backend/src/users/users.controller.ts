import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  BadRequestException
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUser } from '@/common/decorators/current-user.decorator'
import { StorageService } from '@/storage/storage.service'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alice' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  oldPassword?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string
}

// best-practice: security-use-guards, api-use-dto-serialization
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@GetUser() user: User) {
    const { password, todos, ...profile } = user
    void password
    void todos
    return profile
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update name or password' })
  updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto)
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload avatar image (stored in MinIO under avatars/)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|gif)/ })
        ],
        exceptionFactory: (error: string) => {
          if (error.includes('expected type is')) {
            return new BadRequestException('messages.error.invalid_file_type')
          }
          if (error.includes('expected size is')) {
            return new BadRequestException('messages.error.file_too_large')
          }
          return new BadRequestException(error)
        }
      })
    )
    file: Express.Multer.File
  ) {
    // Upload to MinIO under "avatars/" folder, store object key in DB
    const objectKey = await this.storageService.uploadFile('avatars', file)
    return this.usersService.updateAvatar(user.id, objectKey)
  }
}
