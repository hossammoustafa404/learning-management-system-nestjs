import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dtos';
import { UUID } from 'crypto';
import { CategoriesService } from '../categories/categories.service';
import { UpdateCourseDto } from './dtos';
import { UsersService } from '../users/users.service';
import { Express } from 'express';
import { SupabaseService } from '../supabase/supabase.service';
import * as path from 'path';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    private categoryServices: CategoriesService,
    private usersServices: UsersService,
    private supabaseService: SupabaseService,
  ) {}

  async create(teacherId: UUID, createCourseDto: CreateCourseDto) {
    // Find the teacher
    const teacher = await this.usersServices.findOneById(teacherId);

    // Create course
    const { raw } = await this.courseRepository
      .createQueryBuilder()
      .insert()
      .values({ ...createCourseDto, teacher })
      .returning('*')
      .execute();

    // Return course
    return raw[0];
  }

  async findMany(categoryId: string | undefined) {
    // Create find many courses query
    let findManyQuery = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category');
    // Add categoryId condition if it exists
    if (categoryId) {
      findManyQuery.where('courses.category.id=:categoryId', { categoryId });
    }

    // Execute query
    const result = await findManyQuery.getManyAndCount();

    // Return courses
    return { courses: result[0], count: result[1] };
  }

  async findOneById(courseId: UUID) {
    // Find one course by id
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where({ id: courseId })
      .getOne();

    // Throw an exception if the course does not exist
    if (!course) {
      throw new NotFoundException('Course does not exist');
    }

    // Return the course
    return course;
  }

  async updateOneById(
    courseId: UUID,
    teacherId: UUID,
    updateCourseDto: UpdateCourseDto,
    courseImage: Express.Multer.File,
  ) {
    // Find the course
    let course = await this.findOneById(courseId);

    // Check teacher ability to delete the chapter
    const { teacher } = course;

    if (teacherId !== teacher.id) {
      throw new ForbiddenException(
        'Teacher can not delete a chapter that belongs to another teacher',
      );
    }

    // If update course dto includes category, find it
    let finalUpdateCourseDto: any = updateCourseDto;
    if (updateCourseDto.category) {
      const category = await this.categoryServices.findOneByTitle(
        updateCourseDto.category,
      );

      finalUpdateCourseDto.category = category;
    }

    // If update course dto includes status === "published", check the possiblity to update it
    if (updateCourseDto.status === 'published') {
      const {
        title,
        description,
        price,
        category: { title: categoryTitle },
      } = course;
      if (!title || !description || !price || !categoryTitle) {
        throw new ForbiddenException(
          'Cannot publish the course until complete the required data',
        );
      }
    }

    // Add category image if it exist
    if (courseImage) {
      // Upload to supabase
      const result = await this.supabaseService.uploadFile(
        'lms-files',
        `courses-pictures/${courseImage.originalname}`,
        courseImage.buffer,
        { contentType: courseImage.mimetype, upsert: true },
      );

      const { data } = this.supabaseService.getPublicUrl(
        'lms-files',
        result.data.path,
      );

      course.image = data.publicUrl;
    }

    // Update the course
    course = { ...course, ...finalUpdateCourseDto };
    await this.courseRepository.save(course);
    // Return the updated course
    return course;
  }

  async deleteOneById(courseId: UUID, teacherId: UUID) {
    // Find the course by id
    const course = await this.findOneById(courseId);

    // Check teacher ability to delete the chapter
    const { teacher } = course;

    if (teacherId !== teacher.id) {
      throw new ForbiddenException(
        'Teacher can not delete a chapter that belongs to another teacher',
      );
    }

    // Delete the course
    const result = await this.courseRepository
      .createQueryBuilder()
      .delete()
      .where({ id: courseId });

    // Return result
    return result;
  }
}
