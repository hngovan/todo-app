import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  StreamableFile,
  Res,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { StorageService } from './storage.service'
import { FileInterceptor } from '@nestjs/platform-express'

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
// best-practice: security-use-guards, api-use-dto-serialization
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Stream a file directly from MinIO using backend proxy.
   * GET /storage/download?key=todos/abc-def.pdf
   */
  @Get('download')
  @ApiOperation({ summary: 'Download an attachment via backend proxy' })
  @ApiQuery({ name: 'key', description: 'MinIO object key e.g. todos/uuid.pdf' })
  async downloadFile(@Query('key') key: string, @Res({ passthrough: true }) res: Response) {
    if (!key || key.trim() === '') {
      throw new BadRequestException('key is required')
    }
    const stream = await this.storageService.getFileStream(key.trim())
    const filename = key.split('/').pop() || 'download'

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`
    })

    return new StreamableFile(stream)
  }

  /**
   * Upload a general file directly.
   * POST /storage/upload?folder=categories
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to a specific folder' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', enum: ['avatars', 'todos', 'categories'] })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Query('folder') folder: 'avatars' | 'todos' | 'categories',
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('File is required')
    if (!['avatars', 'todos', 'categories'].includes(folder)) {
      throw new BadRequestException('Invalid folder')
    }
    const key = await this.storageService.uploadFile(folder, file)
    return { key, url: this.storageService.getPublicUrl(key) }
  }
}
