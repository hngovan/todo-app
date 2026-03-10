import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger'
import { TodosService } from './todos.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GetUser } from '@/common/decorators/current-user.decorator'
import { StorageService } from '@/storage/storage.service'
import { User } from '@/users/entities/user.entity'
import { TodoFilter, TodoSort, TODO_CONSTRAINTS } from '@/common/constants/todo.constants'

// best-practice: security-use-guards, api-use-dto-serialization
@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly storageService: StorageService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all todos for current user' })
  @ApiQuery({ name: 'filter', enum: TodoFilter, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', enum: TodoSort, required: false })
  findAll(
    @GetUser() user: User,
    @Query('filter') filter?: TodoFilter,
    @Query('search') search?: string,
    @Query('sort') sort?: TodoSort
  ) {
    return this.todosService.findAll(user.id, filter, search, sort)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single todo by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.todosService.findOne(id, user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  create(@Body() dto: CreateTodoDto, @GetUser() user: User) {
    return this.todosService.create(dto, user.id)
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle todo completion status' })
  toggle(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.todosService.toggle(id, user.id)
  }

  @Post(':id/attachments')
  @ApiOperation({
    summary: `Upload attachments for a todo (images, PDF, CSV — max ${TODO_CONSTRAINTS.MAX_ATTACHMENTS} files, 10 MB each)`
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', TODO_CONSTRAINTS.MAX_ATTACHMENTS))
  async uploadAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const objectKeys = await Promise.all(files.map(file => this.storageService.uploadFile('todos', file)))
    return this.todosService.addImages(id, user.id, objectKeys)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTodoDto, @GetUser() user: User) {
    return this.todosService.update(id, dto, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.todosService.remove(id, user.id)
  }
}
