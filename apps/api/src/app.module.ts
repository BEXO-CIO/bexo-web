import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ParserModule } from './modules/parser/parser.module';
import { AssetsModule } from './modules/assets/assets.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ActivationModule } from './modules/activation/activation.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    ProfilesModule,
    ParserModule,
    AssetsModule,
    TemplatesModule,
    ActivationModule,
    BillingModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
