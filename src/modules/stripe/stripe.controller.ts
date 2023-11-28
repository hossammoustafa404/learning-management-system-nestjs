import {
  Controller,
  Post,
  UseGuards,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  BadRequestException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { RequestWithUser } from 'src/shared/interfaces';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { RolesGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators';
import { UserRole } from '../users/enums/user-role.enum';
import { UUID } from 'crypto';

@Controller(['stripe', 'courses/:courseId/stripe'])
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Student)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Req() req: RequestWithUser,
    @Param('courseId', ParseUUIDPipe) courseId: UUID,
  ) {
    const session = await this.stripeService.createSession(req.user, courseId);
    return { url: session.url };
  }

  @Post('webhook')
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('stripe-signature header must be provided');
    }

    const event = this.stripeService.constructEventFromPayload(
      signature,
      req.rawBody,
    );

    const data: any = event.data.object;

    const stripe = this.stripeService.getStripe;

    const customer: any = await stripe.customers.retrieve(data.customer);
    const metadata = data.metadata;

    switch (event.type) {
      case 'payment_intent.succeeded':
        const studentId = customer.metadata.userId;
        const courseId = metadata.courseId;
        const paymentIntent = data.id;

        await this.enrollmentsService.create(
          studentId,
          courseId,
          paymentIntent,
        );
      default:
        break;
    }
  }
}
