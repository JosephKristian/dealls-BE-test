import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SECRET } from 'src/common/constants/constanta';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:SECRET
    });
  }

  async validate(payload: any) {
    const user = { 
      id: payload.sub, 
      username: payload.username,
      role: payload.role,
     };
    return user;
  }

}
