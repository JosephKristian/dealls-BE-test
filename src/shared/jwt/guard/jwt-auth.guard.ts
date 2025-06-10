import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any) {
    console.log('JwtAuthGuard - handleRequest called');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);

    if (err || !user) {
      throw err || new Error('Unauthorized');
    }


    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user;
  }
}
