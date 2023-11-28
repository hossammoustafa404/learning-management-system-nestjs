import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CategoriesModule } from '../categories/categories.module';
import { CoursesService } from './courses.service';
import { UsersModule } from '../users/users.module';
import { SupabaseModule } from '../supabase/supabse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    CategoriesModule,
    UsersModule,
    SupabaseModule,
  ],
  exports: [CoursesService],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {
  constructor() {}
}
