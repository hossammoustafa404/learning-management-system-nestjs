import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SiteUser } from 'src/modules/users/entities/site-user.entity';
import { RefreshToken } from 'src/modules/auth/entities';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { Chapter } from 'src/modules/chapters/entities';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        synchronize: true,
        entities: [
          SiteUser,
          RefreshToken,
          Category,
          Course,
          Chapter,
          Enrollment,
        ],
      }),
    }),
  ],
})
export class DatabaseModule {}
