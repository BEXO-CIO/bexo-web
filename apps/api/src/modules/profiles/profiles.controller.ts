import { Controller, Get, Patch, Body, Param, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('profile')
@UseGuards(JwtGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getProfile(@Req() request: any) {
    const userId = request.user.userId;
    return this.profilesService.getProfileByUserId(userId);
  }

  @Patch()
  async patchProfile(
    @Req() request: any,
    @Body() body: { headline?: string; career_goal?: string; bio?: string }
  ) {
    const userId = request.user.userId;
    return this.profilesService.patchProfile(userId, body);
  }

  @Get('completion')
  async getCompletionScore(@Req() request: any) {
    const userId = request.user.userId;
    return this.profilesService.getCompletionScore(userId);
  }

  @Get('sections/:type')
  async getProfileSection(
    @Req() request: any,
    @Param('type') type: string
  ) {
    const userId = request.user.userId;
    return this.profilesService.getProfileSection(userId, type);
  }

  @Patch('sections/:type')
  @HttpCode(HttpStatus.OK)
  async patchProfileSection(
    @Req() request: any,
    @Param('type') type: string,
    @Body('entries') entries: any[],
    @Body('reviewed_at') reviewedAtString?: string | null
  ) {
    const userId = request.user.userId;
    const reviewedAt = reviewedAtString ? new Date(reviewedAtString) : null;
    return this.profilesService.patchProfileSection(userId, type, entries || [], reviewedAt);
  }
}
