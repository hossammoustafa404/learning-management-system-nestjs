import { CustomBaseEntity } from 'src/shared/entities';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CourseStatus } from '../enums';
import { Category } from '../../categories/entities';
import { SiteUser } from '../../users/entities';
import { Chapter } from '../../chapters/entities';
import { Enrollment } from '../../enrollments/entities';

@Entity()
export class Course extends CustomBaseEntity {
  @Column({ unique: true, length: 50 })
  title: string;

  @Column({ length: 300, nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, type: 'decimal' })
  price: number;

  @Column({ default: 'unpublished', nullable: true }) // Future edit remove nullable
  status: CourseStatus;

  @ManyToOne((type) => Category, (category) => category.courses, {
    cascade: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne((type) => SiteUser, (teacher) => teacher.courses, {
    cascade: true,
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: SiteUser;

  @OneToMany((type) => Chapter, (chapter) => chapter.course)
  chapters: Chapter[];

  @OneToMany((type) => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
