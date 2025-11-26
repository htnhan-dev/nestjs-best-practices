import { BaseService } from '@/common/base';
import { Injectable } from '@nestjs/common';
import { UserDocument } from '@/modules/user/schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(userRepository: UserRepository) {
    super(userRepository, 'User');
  }
}
