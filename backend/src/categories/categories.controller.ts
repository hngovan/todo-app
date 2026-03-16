import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUser } from '@/common/decorators/current-user.decorator'
import { User } from '@/users/entities/user.entity'

// best-practice: security-use-guards, api-use-dto-serialization
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for current user' })
  findAll(@GetUser() user: User) {
    return this.categoriesService.findAll(user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() dto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(dto, user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.update(id, dto, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.categoriesService.remove(id, user.id)
  }
}
