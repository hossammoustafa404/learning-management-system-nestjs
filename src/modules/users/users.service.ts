import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos';
import { hash } from 'src/shared/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteUser } from './entities/site-user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { PostgresErrorCodes } from '../database/enums/postgresErrorCodes.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateMeDto } from './dtos/update-me.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(SiteUser) private userRepository: Repository<SiteUser>,
  ) {}

  async createOne(createUserDto: CreateUserDto) {
    try {
      // Hash password
      const hashedPass = await hash(createUserDto.password);

      // Create user
      const { raw } = await this.userRepository
        .createQueryBuilder('user')
        .insert()
        .values({
          ...createUserDto,
          password: hashedPass,
        })
        .returning('*')
        .execute();

      return raw[0];
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.code === PostgresErrorCodes.UniqueViolation) {
          throw new ConflictException(error.driverError.detail);
        }
      }
      throw error;
    }
  }

  async findMany() {
    // Get users
    const users = await this.userRepository.createQueryBuilder().getMany();

    // Return users
    return users;
  }

  async findOneById(userId: string) {
    const siteUser = await this.userRepository
      .createQueryBuilder()
      .where({ id: userId })
      .getOne();

    // Throw an error if user does not exist
    if (!siteUser) {
      throw new NotFoundException('User does not exist');
    }

    // Return user
    return siteUser;
  }

  async findOneByEmail(email: string) {
    // Find user
    const user = await this.userRepository
      .createQueryBuilder()
      .where({ email })
      .getOne();

    // Throw an error if user does not exist
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // Return user if it exist
    return user;
  }
  async updateOneById(
    userId: string,
    updateUserDto: UpdateUserDto | UpdateMeDto | { stripeCustomerId: string }, // Make user interface to avoid this bad code???
  ) {
    // Update user
    const { raw } = await this.userRepository
      .createQueryBuilder()
      .update()
      .set(updateUserDto)
      .where({ id: userId })
      .returning('*')
      .execute();

    // Throw an error if user does not exist
    if (!raw.length) {
      throw new NotFoundException('User does not exist');
    }

    // Return updated user
    return raw[0];
  }

  async deleteOneById(userId: string) {
    // Delete user
    const result = await this.userRepository
      .createQueryBuilder()
      .delete()
      .where({ id: userId })
      .execute();

    // Throw an error if user does not exist
    if (result.affected === 0) {
      throw new NotFoundException('User does not exist');
    }

    // Return result
    return result;
  }
}
