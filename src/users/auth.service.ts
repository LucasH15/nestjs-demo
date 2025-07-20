import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersServices: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersServices.find(email);

    if (users.length) {
      throw new BadRequestException('Email is use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    return await this.usersServices.create(email, result);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersServices.find(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storeHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storeHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password');
    }

    return user;
  }
}
