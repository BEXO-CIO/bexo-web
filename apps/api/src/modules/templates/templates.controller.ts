import { Controller, Get, Post, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getTemplates() {
    return this.templatesService.getTemplates();
  }

  @Get(':id/themes')
  @UseGuards(JwtGuard)
  async getThemes(@Param('id') templateId: string) {
    return this.templatesService.getThemesForTemplate(templateId);
  }

  @Post('preview/token')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getPreviewToken(@Req() request: any) {
    const userId = request.user.userId;
    return this.templatesService.generatePreviewToken(userId);
  }

  @Get('preview/:token')
  async resolvePreview(@Param('token') token: string) {
    return this.templatesService.resolvePreviewToken(token);
  }
}
