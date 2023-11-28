import { Controller, Get, ParseUUIDPipe, Param } from '@nestjs/common';

import { UUID } from 'crypto';
import { EnrollmentsService } from './enrollments.service';

@Controller([
  'enrollments',
  'courses/:courseId/enrollments',
  'users/:userId/enrollments',
])
export class EnrollmentsController {
  constructor(private erollmentsService: EnrollmentsService) {}

  @Get()
  async findManyByCourseId(@Param('courseId', ParseUUIDPipe) courseId: UUID) {
    const { enrollments, count } =
      await this.erollmentsService.findManyByCourseId(courseId);
    return { count, enrollments };
  }

  @Get()
  async findManyByUserId(@Param('userId', ParseUUIDPipe) userId: UUID) {
    const { enrollments, count } =
      await this.erollmentsService.findManyByUserId(userId);
    return { count, enrollments };
  }

  
}
