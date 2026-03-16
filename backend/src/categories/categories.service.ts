import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

// best-practice: arch-use-repository-pattern, arch-single-responsibility, devops-use-logging
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name)

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' }
    })
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) throw new NotFoundException('messages.error.category_not_found')
    if (category.userId !== userId) throw new ForbiddenException('messages.error.access_denied')
    return category
  }

  async create(dto: CreateCategoryDto, userId: string): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { name: dto.name, userId } })
    if (existing) throw new ConflictException('messages.error.category_name_exists')

    const category = this.categoryRepository.create({
      ...dto,
      color: dto.color ?? '#6366f1',
      userId
    })
    const saved = await this.categoryRepository.save(category)
    this.logger.log(`[create] Category created — id=${saved.id} name="${saved.name}" userId=${userId}`)
    return saved
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string): Promise<Category> {
    const category = await this.findOne(id, userId)

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({ where: { name: dto.name, userId } })
      if (existing) throw new ConflictException('messages.error.category_name_exists')
    }

    Object.assign(category, dto)
    const saved = await this.categoryRepository.save(category)
    this.logger.log(`[update] Category updated — id=${saved.id} name="${saved.name}"`)
    return saved
  }

  async remove(id: string, userId: string): Promise<Category> {
    const category = await this.findOne(id, userId)
    await this.categoryRepository.remove(category)
    this.logger.log(`[remove] Category deleted — id=${id} userId=${userId}`)
    return category
  }
}
