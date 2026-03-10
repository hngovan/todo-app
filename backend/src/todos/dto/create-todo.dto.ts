import { IsString, IsOptional, MinLength, MaxLength, IsDateString, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Priority, TODO_CONSTRAINTS } from '@/common/constants/todo.constants'

// best-practice: security-validate-all-input
export class CreateTodoDto {
  @ApiProperty({ example: 'Buy groceries' })
  @IsString()
  @MinLength(1)
  @MaxLength(TODO_CONSTRAINTS.MAX_TITLE_LENGTH)
  title: string

  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  dueDate: string

  @ApiPropertyOptional({ enum: Priority, default: Priority.Medium })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority
}
