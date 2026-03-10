import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Todo } from './entities/todo.entity'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { TodoFilter, TodoSort, PRIORITY_ORDER } from '@/common/constants/todo.constants'

// best-practice: arch-use-repository-pattern, arch-single-responsibility, devops-use-logging
@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name)

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  async findAll(userId: string, filter?: TodoFilter, search?: string, sort?: TodoSort): Promise<Todo[]> {
    const where: Record<string, unknown> = { userId }

    if (filter === TodoFilter.Active) where.completed = false
    else if (filter === TodoFilter.Completed) where.completed = true

    if (search?.trim()) {
      where.title = Like(`%${search.trim()}%`)
    }

    // DB-level sort for date fields
    let order: Record<string, 'ASC' | 'DESC'> = { createdAt: 'DESC' }
    if (sort === TodoSort.CreatedAtAsc) order = { createdAt: 'ASC' }
    else if (sort === TodoSort.CreatedAtDesc) order = { createdAt: 'DESC' }

    const todos = await this.todoRepository.find({ where, order })

    // Priority sort done in-memory (avoids complex CASE WHEN SQL)
    if (sort === TodoSort.PriorityDesc) {
      todos.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    } else if (sort === TodoSort.PriorityAsc) {
      todos.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])
    }

    return todos
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } })
    if (!todo) throw new NotFoundException('messages.error.todo_not_found')
    if (todo.userId !== userId) throw new ForbiddenException('messages.error.access_denied')
    return todo
  }

  private async checkDuplicateTitle(title: string, userId: string, excludeId?: string): Promise<void> {
    const existing = await this.todoRepository.findOne({
      where: { title, userId }
    })
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('messages.error.todo_title_exists')
    }
  }

  async create(dto: CreateTodoDto, userId: string): Promise<Todo> {
    await this.checkDuplicateTitle(dto.title, userId)
    const todo = this.todoRepository.create({ ...dto, userId })
    const saved = await this.todoRepository.save(todo)
    this.logger.log(`[create] Todo created — id=${saved.id} title="${saved.title}" userId=${userId}`)
    return saved
  }

  async update(id: string, dto: UpdateTodoDto, userId: string): Promise<Todo> {
    this.logger.debug(`[update] START — id=${id} userId=${userId}`)
    this.logger.debug(`[update] Incoming DTO: ${JSON.stringify(dto)}`)

    const todo = await this.findOne(id, userId)
    this.logger.debug(
      `[update] Current entity before merge: ${JSON.stringify({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate,
        images: todo.images
      })}`
    )

    if (dto.title && dto.title !== todo.title) {
      await this.checkDuplicateTitle(dto.title, userId, id)
    }

    Object.assign(todo, dto)

    this.logger.debug(
      `[update] Entity after merge (before save): ${JSON.stringify({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate,
        images: todo.images
      })}`
    )

    const saved = await this.todoRepository.save(todo)

    this.logger.log(
      `[update] DONE — id=${saved.id} title="${saved.title}" completed=${saved.completed} priority=${saved.priority}`
    )

    return saved
  }

  async remove(id: string, userId: string): Promise<Todo> {
    const todo = await this.findOne(id, userId)
    await this.todoRepository.remove(todo)
    this.logger.log(`[remove] Todo deleted — id=${id} userId=${userId}`)
    return todo
  }

  async toggle(id: string, userId: string): Promise<Todo> {
    const todo = await this.findOne(id, userId)
    todo.completed = !todo.completed
    const saved = await this.todoRepository.save(todo)
    this.logger.log(`[toggle] id=${id} completed=${saved.completed}`)
    return saved
  }

  async addImages(id: string, userId: string, filenames: string[]): Promise<Todo> {
    const todo = await this.findOne(id, userId)
    const existing = todo.images ?? []
    todo.images = [...existing, ...filenames]
    const saved = await this.todoRepository.save(todo)
    this.logger.log(`[addImages] id=${id} totalImages=${saved.images?.length ?? 0}`)
    return saved
  }
}
