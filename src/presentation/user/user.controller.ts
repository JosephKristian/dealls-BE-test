import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserUseCase } from 'src/application/user/use-cases/create-user.use-case';
import { CreateUserDto } from 'src/application/user/dto/user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    const user = req.user;
    return {
      message: 'Authenticated user',
      data: user,
    };
  }
}
