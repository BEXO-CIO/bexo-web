import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('activation')
@UseGuards(JwtGuard)
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateKeys(
    @Body('orgId') orgId: string,
    @Body('count') count: number
  ) {
    return this.activationService.generateKeysBatch(orgId, count || 5);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  async redeemKey(
    @Req() request: any,
    @Body('code') code: string
  ) {
    const userId = request.user.userId;
    return this.activationService.redeemKey(userId, code);
  }
}
