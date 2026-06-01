import { Controller, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminUserDto } from './dto/admin-user.dto';

@Controller('api/admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  async createUser(@Body() payload: AdminUserDto) {
    return this.adminUsersService.createUser(payload);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() payload: AdminUserDto) {
    return this.adminUsersService.updateUser(id, payload);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }
}
