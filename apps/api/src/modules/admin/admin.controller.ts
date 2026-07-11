import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/search')
  async searchUsers(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.searchUsers(query || '', pageNum, limitNum);
  }

  @Post('users/:id/impersonate')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @Req() request: any,
    @Param('id') targetUserId: string
  ) {
    const adminUserId = request.user.userId;
    return this.adminService.impersonateUser(adminUserId, targetUserId);
  }

  @Post('billing/refund')
  @HttpCode(HttpStatus.OK)
  async refund(
    @Req() request: any,
    @Body('paymentId') paymentId: string
  ) {
    const adminUserId = request.user.userId;
    return this.adminService.refundPayment(adminUserId, paymentId);
  }
}
