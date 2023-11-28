import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { UUID } from 'crypto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}
  async create(studentId: UUID, courseId: UUID, paymentIntentId: string) {
    // Find the student by id
    const student = await this.usersService.findOneById(studentId);

    // Find the course by id
    const course = await this.coursesService.findOneById(courseId);

    // Create the enrollment
    const { raw } = await this.enrollmentRepository
      .createQueryBuilder()
      .insert()
      .values({ student, course, paymentIntentId })
      .returning('*')
      .execute();

    // Return the enrollment
    return raw[0];
  }

  async findManyByCourseId(courseId: UUID) {
    // Find many enrollments and their count by course id
    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where('enrollment.course.id=:courseId', { courseId })
      .getManyAndCount();

    // Return the enrollments and their count
    return { enrollments: result[0], count: result[1] };
  }

  async findManyByUserId(userId: UUID) {
    // Find many enrollments and their count by course id
    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where('enrollment.course.id=:courseId', { userId })
      .getManyAndCount();

    // Return the enrollments and their count
    return { enrollments: result[0], count: result[1] };
  }

  async findOneByUserAndCourseIds(userId: UUID, courseId: UUID) {
    // Find the enrollment
    const enrollment = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.student.id=:userId', {
        userId,
      })
      .andWhere('enrollment.course.id=:courseId', { courseId })
      .getOne();

    // Return null if the enrollment does not exist
    if (!enrollment) {
      return null;
    }

    // Return the enrollment
    return enrollment;
  }
}
