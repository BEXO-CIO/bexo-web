import { Controller, Post, Body, Req, UseGuards, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Req() request: any,
    @Body('plan') plan: 'annual' | 'lifetime'
  ) {
    const userId = request.user.userId;
    if (plan !== 'annual' && plan !== 'lifetime') {
      throw new BadRequestException("Invalid plan selection. Choose either 'annual' or 'lifetime'.");
    }
    return this.billingService.createCheckoutOrder(userId, plan);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: any, @Body() body: any) {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      throw new BadRequestException('Missing x-razorpay-signature header.');
    }

    // Retrieve raw body buffer as string
    const rawBodyString = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(body);

    const isValid = this.billingService.verifySignature(rawBodyString, signature);
    if (!isValid) {
      console.warn('[Billing Webhook Security] Signature verification failed.');
      throw new BadRequestException('Invalid signature verification.');
    }

    // Process payment capturing / completion events
    if (body.event === 'order.paid' || body.event === 'payment.captured') {
      const result = await this.billingService.processPaidWebhook(body.payload);
      return { status: 'processed', ...result };
    }

    return { status: 'ignored', event: body.event };
  }
}
