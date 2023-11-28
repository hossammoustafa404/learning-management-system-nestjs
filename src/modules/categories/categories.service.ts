import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos';
import { UUID } from 'crypto';
import { UpdateCategoryDto } from './dtos';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Create category
    const { raw } = await this.categoryRepository
      .createQueryBuilder()
      .insert()
      .values(createCategoryDto)
      .returning('*')
      .execute();

    // Return category
    return raw[0];
  }

  async findMany() {
    // Find categories
    const result = await this.categoryRepository
      .createQueryBuilder()
      .getManyAndCount();

    // Return categories
    return { categories: result[0], count: result[1] };
  }

  async findOneById(categoryId: UUID) {
    // Find category by id
    const category = await this.categoryRepository
      .createQueryBuilder()
      .where({ id: categoryId })
      .getOne();

    // Throw an exception if category does not exist
    if (!category) {
      throw new NotFoundException('Category does not exist');
    }

    // Return category
    return category;
  }

  async findOneByTitle(title: string) {
    // Find one category by title
    const category = await this.categoryRepository
      .createQueryBuilder()
      .where({ title })
      .getOne();

    // Throw an exception if the category does not exist
    if (!category) {
      throw new NotFoundException('Category does not exist');
    }

    // Return category
    return category;
  }

  async updateOneById(categoryId: UUID, updateCategoryDto: UpdateCategoryDto) {
    // Update category by id
    const { raw } = await this.categoryRepository
      .createQueryBuilder()
      .update()
      .set(updateCategoryDto)
      .returning('*')
      .execute();

    // Throw an exception if category does not exist
    if (!raw.length) {
      throw new NotFoundException('Category does not exist');
    }

    // Return updated category
    return raw[0];
  }

  async deleteOneById(categoryId: UUID) {
    // Delete one by id
    const result = await this.categoryRepository
      .createQueryBuilder()
      .delete()
      .where({ id: categoryId })
      .execute();

    // Throw an exception if category does not exist
    if (result.affected === 0) {
      throw new NotFoundException('Category does not exist');
    }

    // Return result
    return result;
  }
}
