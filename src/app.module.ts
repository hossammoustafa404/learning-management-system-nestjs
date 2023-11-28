import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { DatabaseModule } from './modules/database/database.module';
import { SupabaseModule } from './modules/supabase/supabse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object().keys({
        NODE_ENV: Joi.valid('development', 'production', 'test').default(
          'development',
        ),
        PORT: Joi.number().default(5000),
        BASE_URL: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().default(5432),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CoursesModule,
    ChaptersModule,
    StripeModule,
    EnrollmentsModule,
    SupabaseModule,
  ],
})
export class AppModule {}
