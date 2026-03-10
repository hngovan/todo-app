import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsDateString, IsEnum, IsArray } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Priority, TODO_CONSTRAINTS } from '@/common/constants/todo.constants'

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

  @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiPropertyOptional({ type: [String], description: 'List of image keys to retain', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] | null
}
