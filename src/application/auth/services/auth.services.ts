import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/application/user/dto/user.dto';
import { CreateUserUseCase } from 'src/application/user/use-cases/create-user.use-case';
import { SECRET } from 'src/common/constants/constanta';
import { User } from 'src/domain/user/entities/user.entity';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class AuthService {
  private userRepository: UserRepository;
  private createUserUseCase: CreateUserUseCase;

  constructor(
    private readonly jwtService: JwtService,
    prisma: PrismaService
  ) {
    this.userRepository = new UserRepository(prisma);
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
  }

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const { password: _password, ...result } = user;
    return result;
  }

  async generateAccessToken(payload: any): Promise<string> {
    const secret = SECRET;
    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '1d',
    });
    return accessToken;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.generateAccessToken(payload);
    

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      expires_in: 900, 
    };
  }

  async register(dto: {
    username: string;
    email: string;
    password: string;
    createdBy: string;
    role?: string;
    requestId?: string;
  }) {
    const existingUserByUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUserByUsername) {
      throw new BadRequestException('Username already taken');
    }

    const existingUserByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingUserByEmail) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.createUserUseCase.execute({
      ...dto,
      password: hashedPassword,
      role: dto.role ? (dto.role as UserRole) : UserRole.Employee,
    });
  }
}
