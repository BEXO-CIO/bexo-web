import { Controller, Post, Body, Req, Res, UseGuards, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('phone/otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body('phone') phone: string,
    @Ip() ip: string
  ) {
    return this.authService.sendOtp(phone, ip);
  }

  @Post('phone/otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) response: express.Response
  ) {
    const { accessToken, refreshToken, user } = await this.authService.verifyOtp(phone, otp);
    
    // Set 7-day rotated refresh token as httpOnly secure cookie
    response.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken, user };
  }

  @Post('google')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async linkGoogle(
    @Req() request: any,
    @Body('token') token: string
  ) {
    const userId = request.user.userId;
    const user = await this.authService.exchangeGoogleToken(userId, token);
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshSession(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response
  ) {
    const oldRefreshToken = request.cookies?.['jid'];
    if (!oldRefreshToken) {
      response.clearCookie('jid');
      return { accessToken: '' };
    }

    const { accessToken, refreshToken } = await this.authService.refreshSession(oldRefreshToken);

    response.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response
  ) {
    const refreshToken = request.cookies?.['jid'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie('jid');
    return { success: true };
  }
}
