import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminPhones: string[];

  constructor() {
    const configuredAdmins = process.env.ADMIN_PHONES || '+919876543210,+919999999999';
    this.adminPhones = configuredAdmins.split(',').map((p) => p.trim());
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.phone) {
      throw new ForbiddenException('Admin access denied. User details missing.');
    }

    const isAdmin = this.adminPhones.includes(user.phone);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access denied. Insufficient privileges.');
    }

    return true;
  }
}
