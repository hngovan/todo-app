import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsArray,
  IsUUID
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { TODO_CONSTRAINTS, PRIORITY_MIN, PRIORITY_MAX } from '@/common/constants/todo.constants'

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TODO_CONSTRAINTS.MAX_TITLE_LENGTH)
  title?: string

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @ApiPropertyOptional({ example: '2026-12-31T14:30:00Z', nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null

  @ApiPropertyOptional({
    example: 5,
    minimum: PRIORITY_MIN,
    maximum: PRIORITY_MAX,
    description: `Priority from ${PRIORITY_MIN} (highest) to ${PRIORITY_MAX} (lowest)`
  })
  @IsOptional()
  @IsInt()
  @Min(PRIORITY_MIN)
  @Max(PRIORITY_MAX)
  priority?: number

  @ApiPropertyOptional({ type: [String], description: 'List of image keys to retain', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] | null

  @ApiPropertyOptional({ example: null, description: 'UUID of the category', nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null
}
