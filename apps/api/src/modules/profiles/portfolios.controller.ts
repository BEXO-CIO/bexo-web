import { Controller, Get, Post, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('portfolio')
@UseGuards(JwtGuard)
export class PortfoliosController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getPortfolio(@Req() request: any) {
    const userId = request.user.userId;
    const portfolio = await this.profilesService.getPortfolioByUserId(userId);
    return { portfolio };
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  async publishPortfolio(
    @Req() request: any,
    @Body() body: { handle: string; selected_template_id: string; selected_theme_id?: string | null }
  ) {
    const userId = request.user.userId;
    return this.profilesService.publishPortfolio(userId, body);
  }
}
