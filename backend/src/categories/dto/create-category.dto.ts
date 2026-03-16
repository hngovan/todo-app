import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// best-practice: security-validate-all-input
export class CreateCategoryDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: '💼' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string

  @ApiPropertyOptional({ example: '#6366f1', description: 'Hex color code' })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'color must be a valid hex color (e.g. #fff or #6366f1)'
  })
  color?: string
}
