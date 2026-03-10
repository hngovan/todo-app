import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { LogLevel } from '@nestjs/common'
import { I18nValidationPipe } from 'nestjs-i18n'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

/**
 * Resolve NestJS logger levels from the LOG_LEVEL env var.
 * Defaults: production → error+warn+log, development → all levels.
 * Override in docker-compose with LOG_LEVEL=debug to see all logs.
 */
function resolveLogLevels(): LogLevel[] {
  const level = process.env.LOG_LEVEL?.toLowerCase()
  if (level === 'verbose') return ['error', 'warn', 'log', 'debug', 'verbose']
  if (level === 'debug') return ['error', 'warn', 'log', 'debug']
  if (level === 'log') return ['error', 'warn', 'log']
  if (level === 'warn') return ['error', 'warn']
  if (level === 'error') return ['error']
  // fallback: full in dev, minimal in prod
  return process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose']
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: resolveLogLevels(),
    bufferLogs: true,
    snapshot: true
  })

  const config = app.get(ConfigService)
  const appUrl = config.get<string>('APP_URL', 'http://localhost:3000')
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173')
  const port = config.get<number>('PORT', 3000)

  // Security — CSP uses env-based URLs, no hardcoded origins
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', appUrl, frontendUrl],
          connectSrc: ["'self'", appUrl, frontendUrl],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    })
  )

  // CORS — origins from env
  app.enableCors({
    origin: [frontendUrl],
    credentials: true
  })

  // Global ValidationPipe — uses class-validator + class-transformer translated by nestjs-i18n (best-practice: security-validate-all-input)
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )

  // Global filters & interceptors (best-practice: arch-use-repository-pattern, error-use-exception-filters)
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo App REST API with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(port)
  console.log(`🚀 Server running on: ${appUrl}`)
  console.log(`📚 Swagger docs: ${appUrl}/api`)
}

void bootstrap()
