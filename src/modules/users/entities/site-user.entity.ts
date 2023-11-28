import { RefreshToken } from '../../auth/entities';
import { Course } from '../../courses/entities/course.entity';
import { CustomBaseEntity } from 'src/shared/entities';
import { Entity, Column, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Enrollment } from '../../enrollments/entities';

@Entity({ name: 'siteUser' })
export class SiteUser extends CustomBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: UserRole.Student })
  role: UserRole;

  @Column({ nullable: true }) // Will edit to false
  stripeCustomerId: string;

  @OneToMany((type) => RefreshToken, (refreshToken) => refreshToken.siteUser)
  refreshTokens: RefreshToken[];

  @OneToMany((type) => Course, (course) => course.teacher)
  courses: Course[];

  @OneToMany((type) => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];
}
