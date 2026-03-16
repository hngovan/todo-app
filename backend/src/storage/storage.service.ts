import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { extname } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export type StorageFolder = 'avatars' | 'todos' | 'categories'

// best-practice: arch-single-responsibility
@Injectable()
export class StorageService {
  private readonly client: Client
  private readonly bucket: string
  private readonly publicUrl: string
  private readonly logger = new Logger(StorageService.name)

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET', 'todo-app')
    this.publicUrl = config.get<string>('MINIO_PUBLIC_URL', 'http://localhost:9000')

    this.client = new Client({
      endPoint: config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: config.get<boolean>('MINIO_USE_SSL', false),
      accessKey: config.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: config.get<string>('MINIO_SECRET_KEY', '')
    })
  }

  /**
   * Upload a file buffer to MinIO under the given folder.
   * If the file is an image, also generates a thumbnail version with '-thumb' suffix.
   * Returns the original object key (e.g. "todos/uuid.jpg") suitable for storing in DB.
   */
  async uploadFile(folder: StorageFolder, file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname).toLowerCase()

    // Create a safe, URL-friendly version of the original filename (without extension)
    const baseName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname
    const safeName = baseName
      .normalize('NFD') // Remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '-') // Replace non-alphanumeric with hyphen
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .toLowerCase()

    // Use a shorter UUID (first 8 chars) to keep the URL readable, plus the safe name
    const shortUuid = uuidv4().substring(0, 8)
    const objectKey = `${folder}/${safeName}_${shortUuid}${ext}`

    try {
      // 1. Upload original file
      await this.client.putObject(this.bucket, objectKey, file.buffer, file.size, {
        'Content-Type': file.mimetype
      })

      // 2. If it's an image, generate and upload a thumbnail
      if (file.mimetype.startsWith('image/')) {
        const thumbBuffer = await sharp(file.buffer)
          .resize(200, 200, { fit: 'cover' })
          // optimize output options
          .webp({ quality: 80 })
          .toBuffer()

        // Thumb always saved as .avif/.webp or just using the same extension but suffixed.
        // It's safer to just keep the same extension string for simplicity or force it:
        const thumbKey = `${folder}/${safeName}_${shortUuid}-thumb.webp`

        await this.client.putObject(this.bucket, thumbKey, thumbBuffer, thumbBuffer.length, {
          'Content-Type': 'image/webp'
        })
      }
    } catch (err) {
      this.logger.error(`Failed to upload to MinIO: ${String(err)}`)
      throw new InternalServerErrorException('File upload failed')
    }

    return objectKey
  }

  /**
   * Delete a file from MinIO by its stored object key.
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectKey)
    } catch (err) {
      this.logger.warn(`Failed to delete object "${objectKey}": ${String(err)}`)
    }
  }

  /**
   * Build the public URL for a stored object key.
   * e.g. "todos/abc.jpg" → "http://localhost:9000/todo-app/todos/abc.jpg"
   */
  getPublicUrl(objectKey: string): string {
    return `${this.publicUrl}/${this.bucket}/${objectKey}`
  }

  /**
   * Generate a presigned download URL for a stored object key.
   * The URL is valid for `expirySeconds` (default 1 hour) and requires no authentication.
   * e.g. "todos/abc.pdf" → "http://localhost:9000/todo-app/todos/abc.pdf?X-Amz-..."
   */
  async getPresignedUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(this.bucket, objectKey, expirySeconds)

      // If running inside docker (MINIO_ENDPOINT=minio), replace 'minio:9000' with 'localhost:9000'
      // so the browser can actually fetch it from outside the docker network.
      const parsedUrl = new URL(url)
      const publicUrlObject = new URL(this.publicUrl)

      parsedUrl.protocol = publicUrlObject.protocol
      parsedUrl.host = publicUrlObject.host

      return parsedUrl.toString()
    } catch (err) {
      this.logger.error(`Failed to generate presigned URL for "${objectKey}": ${String(err)}`)
      throw new InternalServerErrorException('Could not generate download URL')
    }
  }

  /**
   * Get a readable stream for a stored object key.
   */
  async getFileStream(objectKey: string) {
    try {
      return await this.client.getObject(this.bucket, objectKey)
    } catch (err) {
      this.logger.error(`Failed to get object stream for "${objectKey}": ${String(err)}`)
      throw new InternalServerErrorException('Could not retrieve file stream')
    }
  }
}
