import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles-guard/roles.guard';
import { Roles } from '../roles-guard/CustomDecorator/custom_decorator';
import { Role } from '../roles-guard/roles.enum';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getAllUsers(parseInt(page), parseInt(limit));
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('products')
  async getAllProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getAllProducts(parseInt(page), parseInt(limit));
  }

  @Get('orders')
  async getAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getAllOrders(parseInt(page), parseInt(limit));
  }

  @Put('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: { status: string },
  ) {
    return this.adminService.updateOrderStatus(orderId, body.status);
  }

  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getAllReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getAllReviews(parseInt(page), parseInt(limit));
  }

  @Put('reviews/:reviewId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async approveReview(@Param('reviewId') reviewId: string) {
    return this.adminService.moderateReview(reviewId, 'approved');
  }

  @Put('reviews/:reviewId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async rejectReview(@Param('reviewId') reviewId: string) {
    return this.adminService.moderateReview(reviewId, 'rejected');
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteReview(@Param('reviewId') reviewId: string) {
    return this.adminService.deleteReview(reviewId);
  }
}
