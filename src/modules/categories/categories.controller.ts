import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Param,
  Patch,
  ParseUUIDPipe,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators';
import { UUID } from 'crypto';
import { UpdateCategoryDto } from './dtos';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin, UserRole.Admin)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return { category };
  }

  @Get()
  async findMany() {
    const { categories, count } = await this.categoriesService.findMany();
    return { count, categories };
  }

  @Get(':categoryId')
  async findOneById(@Param('categoryId', ParseUUIDPipe) categoryId: UUID) {
    const category = await this.categoriesService.findOneById(categoryId);
    return { category };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin, UserRole.Admin)
  @Patch(':categoryId')
  async updateOneById(
    @Param('categoryId', ParseUUIDPipe) categoryId: UUID,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updatedCategory = await this.categoriesService.updateOneById(
      categoryId,
      updateCategoryDto,
    );

    return { category: updatedCategory };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin, UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':categoryId')
  async deleteOneById(@Param('categoryId', ParseUUIDPipe) categoryId: UUID) {
    await this.categoriesService.deleteOneById(categoryId);
  }
}
