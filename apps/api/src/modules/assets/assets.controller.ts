import { Controller, Post, Body, Req, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('assets')
@UseGuards(JwtGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async getUploadUrl(
    @Req() request: any,
    @Body('filename') filename: string,
    @Body('size_bytes') sizeBytes: number,
    @Body('section_type') sectionType: string,
    @Body('kind') kind: 'image' | 'pdf'
  ) {
    const userId = request.user.userId;
    return this.assetsService.getPresignedUploadUrl(userId, filename, sizeBytes, sectionType, kind);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @Req() request: any,
    @Body('assetId') assetId: string,
    @Body('filename') filename: string,
    @Body('size_bytes') sizeBytes: number,
    @Body('section_type') sectionType: string,
    @Body('kind') kind: 'image' | 'pdf',
    @Body('s3Key') s3Key: string,
    @Body('entryId') entryId?: string | null
  ) {
    const userId = request.user.userId;
    return this.assetsService.confirmAssetUpload(
      userId,
      assetId,
      filename,
      sizeBytes,
      sectionType,
      kind,
      s3Key,
      entryId
    );
  }

  @Delete(':id')
  async deleteAsset(
    @Req() request: any,
    @Param('id') assetId: string
  ) {
    const userId = request.user.userId;
    await this.assetsService.deleteAsset(userId, assetId);
    return { success: true };
  }
}
