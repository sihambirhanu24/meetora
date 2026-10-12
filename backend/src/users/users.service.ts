import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only update allowed fields
    const allowedFields = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      bio: updateProfileDto.bio,
      jobTitle: updateProfileDto.jobTitle,
    };

    // Remove undefined fields
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined),
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.sanitizeUser(updatedUser);
  }

  private sanitizeUser(user: any) {
    const {
      passwordHash,
      passwordResetToken,
      passwordResetExpiresAt,
      emailVerificationToken,
      emailVerificationExpiresAt,
      ...safeUser
    } = user;
    return safeUser;
  }
}
