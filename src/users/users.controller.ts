import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Guard import
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // (POST /users)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // (GET /verify-email)
    @Get('verify-email')
    verifyEmail(@Query('token') token: string) {
        return this.usersService.verifyEmail(token);
    }

    // (GET /users)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin') // Only admin can access
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    //(GET /users/:id)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id); // +id coverts string to number
    }

    // (PUT /users/:id)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin') // Only admin can update
    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    // (DELETE /users/:id)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin') // Only admin can delete
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    // (DELETE /users/all/delete)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin') // Only admin can delete all users
    @Delete('all/delete')
    removeAll() {
        return this.usersService.removeAll();
    }
}