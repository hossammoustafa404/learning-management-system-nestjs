import { CustomBaseEntity } from 'src/shared/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChapterAccess, ChapterStatus } from '../enums';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Chapter extends CustomBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  objectives: string;

  @Column({ enum: ChapterStatus, default: ChapterStatus.Unpublished })
  status: ChapterStatus;

  @Column({ enum: ChapterAccess, default: ChapterAccess.Paid })
  access: ChapterAccess;

  @ManyToOne((type) => Course, (course) => course.chapters, { cascade: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
