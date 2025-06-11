import { Test, TestingModule } from '@nestjs/testing';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/shared/database/prisma.service';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { CreateUserUseCase } from 'src/application/user/use-cases/create-user.use-case';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from 'src/application/user/dto/user.dto';
import { AuthService } from 'src/application/auth/services/auth.services';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    let jwtService: Partial<JwtService>;

    const mockUser = {
        id: 'user-123',
        username: 'johndoe',
        email: 'john@example.com',
        password: '$2b$10$mockedhashedpassword',
        role: 'Employee',
        createdBy: 'admin',
        createdAt: new Date(),
        isDeleted: false,
    };

    beforeEach(async () => {
        userRepository = {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            // tambahkan method lain jika dipakai
        } as unknown as jest.Mocked<UserRepository>;


        jwtService = {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: jwtService },
                { provide: PrismaService, useValue: {} },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        // inject mocked repository manually
        (service as any).userRepository = userRepository;
        (service as any).createUserUseCase = {
            execute: jest.fn().mockResolvedValue(mockUser),
        };
    });

    describe('validateUser', () => {
        it('should return user without password if valid', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true); // fixed here

            const result = await service.validateUser('johndoe', 'password');
            expect(result).toBeDefined();
            expect(result).toHaveProperty('username', 'johndoe');
            expect(result).not.toHaveProperty('password');
        });

        it('should return null if user not found', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
            const result = await service.validateUser('nouser', 'password');
            expect(result).toBeNull();
        });

        it('should return null if password is incorrect', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

            const result = await service.validateUser('johndoe', 'wrongpass');
            expect(result).toBeNull();
        });

    });

    describe('login', () => {
        it('should return access token with correct format', async () => {
            const payload = {
                id: 'user-123',
                username: 'johndoe',
                role: 'Employee',
            };

            const result = await service.login(payload);
            expect(result).toEqual({
                token_type: 'Bearer',
                access_token: 'mocked-jwt-token',
                expires_in: 900,
            });
        });
    });

    describe('register', () => {
        it('should throw if username already exists', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(mockUser);
            await expect(
                service.register({
                    username: 'johndoe',
                    email: 'new@example.com',
                    password: 'secret',
                    createdBy: 'admin',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw if email already exists', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

            await expect(
                service.register({
                    username: 'newuser',
                    email: 'john@example.com',
                    password: 'secret',
                    createdBy: 'admin',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should register a new user and hash password', async () => {
            (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
            (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-password');

            const result = await service.register({
                username: 'newuser',
                email: 'new@example.com',
                password: 'secret',
                createdBy: 'admin',
                role: UserRole.Admin,
            });

            expect(result).toBeDefined();
            expect((service as any).createUserUseCase.execute).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashed-password',
                createdBy: 'admin',
                role: UserRole.Admin,
            });
        });

    });
});
