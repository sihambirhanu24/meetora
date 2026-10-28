import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeetingsModule } from './meetings/meetings.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MessagesModule } from './messages/messages.module';
import { RecordingsModule } from './recordings/recordings.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    MeetingsModule,
    WorkspacesModule,
    MessagesModule,
    RecordingsModule,
    SearchModule,
  ],
})
export class AppModule {}
