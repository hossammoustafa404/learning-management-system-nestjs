import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities';
import { Repository } from 'typeorm';
import { CreateChapterDto, UpdateChapterDto } from './dtos';
import { UUID } from 'crypto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private chapterRepository: Repository<Chapter>,
    private coursesService: CoursesService,
  ) {}

  async create(courseId: UUID, createChapterDto: CreateChapterDto) {
    // Get related course
    const course = await this.coursesService.findOneById(courseId);

    // Create chapter
    const { raw } = await this.chapterRepository
      .createQueryBuilder()
      .insert()
      .values({ ...createChapterDto, course })
      .returning('*')
      .execute();

    // Return chapter
    return raw[0];
  }

  async findMany(courseId: UUID) {
    // Find many chapters and their count by their course id
    const result = await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.course.id = :courseId', { courseId })
      .getManyAndCount();

    // return chapters and their count
    return { chapters: result[0], count: result[1] };
  }

  async findOneById(chapterId: UUID) {
    // Find one chapter by id
    const chapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where({ id: chapterId })
      .getOne();
    // Throw an exception if the chapter does not exist
    if (!chapter) {
      throw new NotFoundException('Chapter does not exist');
    }

    // Return chapter
    return chapter;
  }

  async updateOneById(
    chapterId: UUID,
    teacherId: UUID,
    updateChapterDto: UpdateChapterDto,
  ) {
    // Find chapter by id
    let chapter = await this.findOneById(chapterId);

    // Check teacher ability to update the chapter
    const {
      course: { teacher: chapterTeacher },
    } = chapter;

    if (teacherId !== chapterTeacher.id) {
      throw new ForbiddenException(
        'Teacher can not update a chapter that belongs to another teacher',
      );
    }

    // Teacher can not publish the chapter if he does not complete the required data
    if (updateChapterDto.status) {
      const { title, access, objectives } = chapter;
      if (!title || !access || !objectives) {
        throw new ForbiddenException(
          'Teacher can not publish the chapter until he complete the required data',
        );
      }
    }

    // Update chapter and save
    chapter = { ...chapter, ...updateChapterDto };
    await this.chapterRepository.save(chapter);

    // Return updated chapter
    return { chapter };
  }

  async deleteOneById(chapterId: UUID, teacherId: UUID) {
    // Find the chapter by id
    const chapter = await this.findOneById(chapterId);

    // Check teacher ability to delete the chapter
    const {
      course: { teacher: chapterTeacher },
    } = chapter;

    if (teacherId !== chapterTeacher.id) {
      throw new ForbiddenException(
        'Teacher can not delete a chapter that belongs to another teacher',
      );
    }

    // Delete the chapter
    const result = await this.chapterRepository
      .createQueryBuilder()
      .delete()
      .where({ id: chapterId })
      .execute();

    // Return result
    return result;
  }
}
