import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UUID } from 'crypto';
import { SiteUser } from '../users/entities';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    private coursesService: CoursesService,
    private usersService: UsersService,
    private enrollmentService: EnrollmentsService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  get getStripe() {
    return this.stripe;
  }
  async createCustomer(userId: UUID, name: string, email: string) {
    const customer = await this.stripe.customers.create({
      name,
      email,
      metadata: {
        userId: userId,
      },
    });
    return customer;
  }

  async createSession(user: SiteUser, courseId: UUID) {
    // Check if the user has already enrollment of the course
    const enrollment = await this.enrollmentService.findOneByUserAndCourseIds(
      user.id,
      courseId,
    );

    if (enrollment) {
      throw new ForbiddenException(
        'User has already enrollment of this course',
      );
    }

    // Create customer if it has been not created yet
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(
        user.id,
        `${user.firstName} ${user.lastName}`,
        user.email,
      );
      customerId = customer.id;
    }

    // Add customer id to the user
    await this.usersService.updateOneById(user.id, {
      stripeCustomerId: customerId,
    });

    // Find the course by id
    const course = await this.coursesService.findOneById(courseId);

    // Create the session
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      customer: customerId,
      payment_intent_data: { metadata: { courseId } },
      mode: 'payment',
      success_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000/checkout/cancel',
    });

    return session;
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET'),
    );

    return event;
  }

  async refund(paymentIntent: string) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntent,
    });
  }
}
