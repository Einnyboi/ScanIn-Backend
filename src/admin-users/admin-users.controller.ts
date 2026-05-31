import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import type { AdminUserDto, AdminUserRole } from './admin-users.service';

@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Put()
  replaceAll() {
    return this.adminUsersService.replaceAll();
  }

  @Post()
  create(@Body() user: AdminUserDto) {
    return this.adminUsersService.create(user);
  }

  @Patch(':role/:id')
  update(
    @Param('role') role: AdminUserRole,
    @Param('id') id: string,
    @Body() user: AdminUserDto,
  ) {
    return this.adminUsersService.update(role, id, user);
  }

  @Delete(':role/:id')
  remove(@Param('role') role: AdminUserRole, @Param('id') id: string) {
    return this.adminUsersService.remove(role, id);
  }
}
