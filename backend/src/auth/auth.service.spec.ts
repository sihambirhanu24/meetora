import { Test, TestingModule } from "@nestjs/testing";
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────
  describe("register", () => {
    const registerDto = {
      email: "test@example.com",
      password: "Password123!",
      firstName: "John",
      lastName: "Doe",
    };

    it("should successfully register a new user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        emailVerified: false,
        accountStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const result = await service.register(registerDto);

      expect(result.message).toContain("Registration successful");
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it("should normalize email to lowercase before storing", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        emailVerified: false,
        accountStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      await service.register({ ...registerDto, email: "TEST@EXAMPLE.COM" });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should throw ConflictException if email already exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should NOT return passwordHash in registration response", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        passwordHash: "SECRET_HASH",
        emailVerified: false,
        accountStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("passwordResetToken");
      expect(result.user).not.toHaveProperty("emailVerificationToken");
    });
  });

  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────
  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "Password123!",
    };

    const mockActiveUser = {
      id: "1",
      email: "test@example.com",
      passwordHash: "hashedPassword",
      accountStatus: "active",
      firstName: "John",
      lastName: "Doe",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully login with correct credentials", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockActiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe("jwt-token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should NOT return sensitive fields in login response", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockActiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("passwordResetToken");
      expect(result.user).not.toHaveProperty("emailVerificationToken");
    });

    it("should throw UnauthorizedException with wrong password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockActiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if account is suspended", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockActiveUser,
        accountStatus: "suspended",
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if account is deleted", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockActiveUser,
        accountStatus: "deleted",
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should normalize email before looking up user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockActiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token");

      await service.login({ ...loginDto, email: "TEST@EXAMPLE.COM" });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  // ─────────────────────────────────────────────
  // Email Verification
  // ─────────────────────────────────────────────
  describe("verifyEmail", () => {
    it("should successfully verify email with valid, non-expired token", async () => {
      const mockUser = {
        id: "1",
        emailVerificationToken: "valid-token",
        emailVerificationExpiresAt: new Date(Date.now() + 10000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.verifyEmail("valid-token");

      expect(result.message).toContain("Email verified");
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        },
      });
    });

    it("should throw BadRequestException with invalid token", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail("invalid-token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException with expired token", async () => {
      // findFirst returns null because the query filters by gte: new Date()
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail("expired-token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should invalidate the token after successful verification", async () => {
      const mockUser = {
        id: "1",
        emailVerificationToken: "valid-token",
        emailVerificationExpiresAt: new Date(Date.now() + 10000),
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      await service.verifyEmail("valid-token");

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            emailVerificationToken: null,
            emailVerificationExpiresAt: null,
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // Forgot Password
  // ─────────────────────────────────────────────
  describe("forgotPassword", () => {
    const forgotPasswordDto = { email: "test@example.com" };

    it("should return generic message when user does NOT exist (prevent enumeration)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toContain("If an account exists");
      // Must NOT throw, must NOT indicate the email was not found
    });

    it("should return generic message and send reset email when user exists", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        accountStatus: "active",
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result.message).toContain("If an account exists");
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it("should generate a time-limited reset token and store it", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      await service.forgotPassword(forgotPasswordDto);

      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.passwordResetToken).toBeDefined();
      expect(updateCall.data.passwordResetExpiresAt).toBeInstanceOf(Date);
      // Should expire roughly 1 hour from now
      expect(
        updateCall.data.passwordResetExpiresAt.getTime(),
      ).toBeGreaterThan(Date.now());
    });
  });

  // ─────────────────────────────────────────────
  // Reset Password
  // ─────────────────────────────────────────────
  describe("resetPassword", () => {
    const resetPasswordDto = {
      token: "valid-reset-token",
      newPassword: "NewPassword123!",
    };

    it("should successfully reset password with valid token", async () => {
      const mockUser = {
        id: "1",
        passwordResetToken: "valid-reset-token",
        passwordResetExpiresAt: new Date(Date.now() + 10000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toContain("Password reset");
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it("should invalidate the reset token after successful reset", async () => {
      const mockUser = {
        id: "1",
        passwordResetToken: "valid-reset-token",
        passwordResetExpiresAt: new Date(Date.now() + 10000),
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

      await service.resetPassword(resetPasswordDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetToken: null,
            passwordResetExpiresAt: null,
          }),
        }),
      );
    });

    it("should hash the new password before storing", async () => {
      const mockUser = {
        id: "1",
        passwordResetToken: "valid-reset-token",
        passwordResetExpiresAt: new Date(Date.now() + 10000),
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

      await service.resetPassword(resetPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123!", 12);
      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.passwordHash).toBe("newHashedPassword");
    });

    it("should throw BadRequestException with expired token", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException with invalid token", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: "bad-token", newPassword: "NewPass1!" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────────
  describe("changePassword", () => {
    const userId = "user-id-123";
    const changePasswordDto = {
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword456!",
    };

    const mockUser = {
      id: userId,
      email: "test@example.com",
      passwordHash: "hashedOldPassword",
      accountStatus: "active",
    };

    it("should successfully change password with correct current password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.changePassword(userId, changePasswordDto);

      expect(result.message).toContain("Password changed");
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword456!", 12);
    });

    it("should throw UnauthorizedException with incorrect current password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword("nonexistent-id", changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should hash the new password before storing", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");
      mockPrismaService.user.update.mockResolvedValue({});

      await service.changePassword(userId, changePasswordDto);

      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.passwordHash).toBe("hashedNewPassword");
    });

    it("should NOT store plaintext password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");
      mockPrismaService.user.update.mockResolvedValue({});

      await service.changePassword(userId, changePasswordDto);

      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.passwordHash).not.toBe("NewPassword456!");
    });
  });

  // ─────────────────────────────────────────────
  // validateUser (used by JwtStrategy)
  // ─────────────────────────────────────────────
  describe("validateUser", () => {
    it("should return sanitized user for valid, active user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        passwordHash: "SECRET",
        emailVerificationToken: "SECRET",
        passwordResetToken: "SECRET",
        accountStatus: "active",
        firstName: "John",
        lastName: "Doe",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser("1");

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty("passwordHash");
      expect(result).not.toHaveProperty("emailVerificationToken");
      expect(result).not.toHaveProperty("passwordResetToken");
    });

    it("should return null for non-existent user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null for suspended user (unauthenticated requests rejected)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "1",
        accountStatus: "suspended",
      });

      const result = await service.validateUser("1");

      expect(result).toBeNull();
    });
  });
});
