
import { IUserRepository, IUserRepositoryToken } from 'src/domain/user/repositories/user.repository';
import { CreateUserDto } from '../dto/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/domain/user/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) { }
  async execute(dto: CreateUserDto) {
    if (!dto.username || dto.username.trim() === '') {
      throw new Error('Username is required');
    }

    if (!dto.email || !/\S+@\S+\.\S+/.test(dto.email)) {
      throw new Error('Invalid email');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const user = new User({
      id: uuidv4(),
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedBy: dto.createdBy,
      updatedAt: new Date(),
      isDeleted: false,
    });

    return this.userRepository.create(user);
  }
}
