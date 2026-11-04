import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MeetingsService } from "./meetings.service";
import { MeetingsController } from "./meetings.controller";
import { MeetingsGateway } from "./meetings.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    PrismaModule, 
    EmailModule, 
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'meetora-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
    }),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsGateway],
  exports: [MeetingsService],
})
export class MeetingsModule {}
