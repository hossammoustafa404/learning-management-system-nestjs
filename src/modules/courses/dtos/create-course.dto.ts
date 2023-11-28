import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;
}
