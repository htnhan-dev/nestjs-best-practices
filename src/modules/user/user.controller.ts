import { BaseController } from '@/common/base';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '@/modules/user/dto';

@Controller('users')
export class UserController extends BaseController<UserDocument> {
  constructor(userService: UserService) {
    super(userService, 'User');
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateUserDto) {
    console.log('☄️ ~ dto:', dto);
    return super._create(dto);
  }
}
