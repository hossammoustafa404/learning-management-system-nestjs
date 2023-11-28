import { Course } from '../../courses/entities';
import { SiteUser } from '../../users/entities';
import { CustomBaseEntity } from 'src/shared/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Enrollment extends CustomBaseEntity {
  @Column({ default: 0 })
  completedChapters: number;

  @Column({ nullable: true })
  paymentIntentId: string;

  @ManyToOne((type) => SiteUser, (student) => student.enrollments)
  @JoinColumn({ name: 'studentId' })
  student: SiteUser;

  @ManyToOne((type) => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
