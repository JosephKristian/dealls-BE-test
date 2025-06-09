// src/shared/jwt/guards/jwt-refresh.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
    handleRequest(err: any, user: any, info: any, context: any) {
        console.log('JwtRefreshGuard - handleRequest called');
        console.log('Error:', err);
        console.log('User:', user);
        console.log('Info:', info);

        if (err || !user) {
            throw err || new Error('Unauthorized');
        }

        return user;
    }
}
