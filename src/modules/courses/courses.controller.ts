import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators';
import { CreateCourseDto } from './dtos';
import { CoursesService } from './courses.service';
import { UUID } from 'crypto';
import { UpdateCourseDto } from './dtos';
import { UserRole } from '../users/enums';
import { RequestWithUser } from 'src/shared/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage, memoryStorage } from 'multer';

@Controller(['categories/:categoryId/courses', 'courses'])
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Teacher)
  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    const course = await this.coursesService.create(
      req.user.id,
      createCourseDto,
    );
    return { course };
  }

  @Get()
  async findMany(
    @Param('categoryId', new ParseUUIDPipe({ optional: true }))
    categoryId: UUID,
  ) {
    const { courses, count } = await this.coursesService.findMany(categoryId);
    return { count, courses };
  }

  @Get(':courseId')
  async findOneById(@Param('courseId', ParseUUIDPipe) courseId: UUID) {
    const course = await this.coursesService.findOneById(courseId);
    return { course };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Teacher)
  @UseInterceptors(
    FileInterceptor('courseImage', {
      storage: memoryStorage(),
    }),
  )
  @Patch(':courseId')
  async updateOneById(
    @Param('courseId', ParseUUIDPipe) courseId: UUID,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: RequestWithUser,
    @UploadedFile() courseImage: Express.Multer.File,
  ) {
    const updatedCourse = await this.coursesService.updateOneById(
      courseId,
      req.user.id,
      updateCourseDto,
      courseImage,
    );
    return { course: updatedCourse };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin, UserRole.Admin, UserRole.Teacher)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':courseId')
  async deleteOneById(
    @Param('courseId', ParseUUIDPipe) courseId: UUID,
    @Req() req: RequestWithUser,
  ) {
    await this.coursesService.deleteOneById(courseId, req.user.id);
  }
}
