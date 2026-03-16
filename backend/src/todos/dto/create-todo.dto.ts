import { IsString, IsOptional, MinLength, MaxLength, IsDateString, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TODO_CONSTRAINTS, PRIORITY_MIN, PRIORITY_MAX, PRIORITY_DEFAULT } from '@/common/constants/todo.constants'

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

  @ApiProperty({ example: '2026-12-31T14:30:00Z' })
  @IsDateString()
  dueDate: string

  @ApiPropertyOptional({
    example: PRIORITY_DEFAULT,
    minimum: PRIORITY_MIN,
    maximum: PRIORITY_MAX,
    default: PRIORITY_DEFAULT,
    description: `Priority from ${PRIORITY_MIN} (highest) to ${PRIORITY_MAX} (lowest)`
  })
  @IsOptional()
  @IsInt()
  @Min(PRIORITY_MIN)
  @Max(PRIORITY_MAX)
  priority?: number

  @ApiPropertyOptional({ example: null, description: 'UUID of the category' })
  @IsOptional()
  @IsString()
  categoryId?: string | null
}
