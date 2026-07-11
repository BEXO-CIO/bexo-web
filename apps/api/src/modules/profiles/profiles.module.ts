import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { PortfoliosController } from './portfolios.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController, PortfoliosController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
