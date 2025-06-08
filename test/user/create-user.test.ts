import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from 'src/application/user/dto/create-user.dto';
import { CreateUserUseCase } from 'src/application/user/use-cases/create-user.use-case';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';

describe('CreateUserUseCase', () => {
    let prisma: PrismaClient;
    let repo: UserRepository;
    let useCase: CreateUserUseCase;

    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });

    beforeAll(() => {
        prisma = new PrismaClient();
        repo = new UserRepository(prisma);
        useCase = new CreateUserUseCase(repo);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should create a user successfully with valid data', async () => {
        const dto: CreateUserDto = {
            username: 'joeytest',
            email: 'joey@test.com',
            password: '123456',
            createdBy: 'system',
        };

        const result = await useCase.execute(dto);
        expect(result).toHaveProperty('id');
        expect(result.username).toBe(dto.username);
        expect(result.email).toBe(dto.email);
    });

    it('should throw error if username is missing', async () => {
        const dto: Partial<CreateUserDto> = {
            email: 'no-username@test.com',
            password: '123456',
            createdBy: 'system',
        };

        await expect(useCase.execute(dto as CreateUserDto)).rejects.toThrowError(/username is required/i);
    });

    it('should throw error if email is invalid', async () => {
        const dto: CreateUserDto = {
            username: 'invalidemail',
            email: 'not-an-email',
            password: '123456',
            createdBy: 'system',
        };

        await expect(useCase.execute(dto)).rejects.toThrowError(/invalid email/i);
    });

    it('should throw error if password is too short', async () => {
        const dto: CreateUserDto = {
            username: 'shortpass',
            email: 'shortpass@test.com',
            password: '123',
            createdBy: 'system',
        };

        await expect(useCase.execute(dto)).rejects.toThrowError(/password must be at least/i);
    });

});
