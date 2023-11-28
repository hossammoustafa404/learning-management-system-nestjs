import { Course } from '../../courses/entities/course.entity';
import { CustomBaseEntity } from 'src/shared/entities';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Category extends CustomBaseEntity {
  @Column({ unique: true })
  title: string;

  @OneToMany((type) => Course, (course) => course.category)
  courses: Course[];
}
