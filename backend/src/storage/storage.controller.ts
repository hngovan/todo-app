import { Controller, Get, Query, UseGuards, BadRequestException, StreamableFile, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { StorageService } from './storage.service'

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
}
