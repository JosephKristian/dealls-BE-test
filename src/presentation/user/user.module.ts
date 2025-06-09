import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { CreateUserUseCase } from 'src/application/user/use-cases/create-user.use-case';
import { UserController } from './user.controller';
import { IUserRepositoryToken } from 'src/domain/user/repositories/user.repository';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { DatabaseModule } from 'src/shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    PrismaService,
    CreateUserUseCase,
    {
      provide: IUserRepositoryToken,
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepositoryToken],
})
export class UserModule {}
