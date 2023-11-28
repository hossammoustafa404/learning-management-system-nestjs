import { CourseStatus } from '../enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsEnum(CourseStatus)
  @IsOptional()
  status: CourseStatus;

  @IsString()
  @IsOptional()
  category: string;
}
