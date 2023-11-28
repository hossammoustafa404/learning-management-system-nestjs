import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateChapterDto, UpdateChapterDto } from './dtos';
import { ChaptersService } from './chapters.service';
import { UUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators';
import { UserRole } from '../users/enums/user-role.enum';
import { RequestWithUser } from 'src/shared/interfaces';

@Controller(['chapters', 'courses/:courseId/chapters'])
export class ChaptersController {
  constructor(private chaptersService: ChaptersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Teacher)
  @Post()
  async create(
    @Param('courseId', ParseUUIDPipe) courseId: UUID,
    @Body() createChapterDto: CreateChapterDto,
  ) {
    const chapter = await this.chaptersService.create(
      courseId,
      createChapterDto,
    );
    return { chapter };
  }

  @Get()
  async findMany(@Param('courseId', ParseUUIDPipe) courseId: UUID) {
    const { chapters, count } = await this.chaptersService.findMany(courseId);
    return { count, chapters };
  }

  @Get(':chapterId')
  async findOneById(@Param('chapterId', ParseUUIDPipe) chapterId: UUID) {
    const chapter = await this.chaptersService.findOneById(chapterId);
    return { chapter };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Teacher)
  @Patch(':chapterId')
  async updateOneById(
    @Param('chapterId', ParseUUIDPipe) chapterId: UUID,
    @Body() updateChapterDto: UpdateChapterDto,
    @Req() req: RequestWithUser,
  ) {
    const updatedChapter = await this.chaptersService.updateOneById(
      chapterId,
      req.user.id,
      updateChapterDto,
    );

    return { chapter: updatedChapter };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Teacher)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':chapterId')
  async deleteOneById(
    @Param('chapterId', ParseUUIDPipe) chapterId: UUID,
    @Req() req: RequestWithUser,
  ) {
    await this.chaptersService.deleteOneById(chapterId, req.user.id);
  }
}
