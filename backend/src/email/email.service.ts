import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const emailProvider = this.configService.get('EMAIL_PROVIDER', 'console');

    if (emailProvider === 'smtp') {
      // Real SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASSWORD'),
        },
      });
    } else {
      // Development: log to console
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'noreply@meetora.com'),
      to,
      subject: 'Verify your Meetora account',
      html: `
        <h1>Welcome to Meetora!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'noreply@meetora.com'),
      to,
      subject: 'Reset your Meetora password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendMeetingInvitation(
    to: string,
    meetingDetails: {
      title: string;
      startTime: Date;
      endTime: Date;
      hostName: string;
      meetingLink: string;
      description?: string;
    },
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const meetingUrl = `${frontendUrl}/meetings`;
    
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    };

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'noreply@meetora.com'),
      to,
      subject: `Meeting Invitation: ${meetingDetails.title}`,
      html: `
        <h1>You're Invited to a Meeting</h1>
        <p><strong>${meetingDetails.hostName}</strong> has invited you to join a meeting.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${meetingDetails.title}</h2>
          ${meetingDetails.description ? `<p>${meetingDetails.description}</p>` : ''}
          <p><strong>Start Time:</strong> ${formatDate(meetingDetails.startTime)}</p>
          <p><strong>End Time:</strong> ${formatDate(meetingDetails.endTime)}</p>
        </div>

        <p>
          <a href="${meetingUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Meeting Details
          </a>
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Meeting Link: <a href="https://${meetingDetails.meetingLink}">${meetingDetails.meetingLink}</a>
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This invitation was sent from Meetora. If you weren't expecting this, you can safely ignore this email.
        </p>
      `,
    };

    await this.sendEmail(mailOptions);
  }

  async sendWorkspaceInvitation(
    to: string,
    invitationDetails: {
      workspaceName: string;
      inviterName: string;
      role: string;
      token: string;
      expiresAt: Date;
    },
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const acceptUrl = `${frontendUrl}/workspaces/invitation?token=${invitationDetails.token}`;
    
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
      }).format(date);
    };

    const roleLabels = {
      owner: 'Owner',
      admin: 'Administrator',
      member: 'Member',
      guest: 'Guest',
    };

    const roleName = roleLabels[invitationDetails.role as keyof typeof roleLabels] || 'Member';

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM', 'noreply@meetora.com'),
      to,
      subject: `Workspace Invitation: ${invitationDetails.workspaceName}`,
      html: `
        <h1>You've Been Invited to Join a Workspace</h1>
        <p><strong>${invitationDetails.inviterName}</strong> has invited you to join their workspace on Meetora.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${invitationDetails.workspaceName}</h2>
          <p><strong>Your Role:</strong> ${roleName}</p>
          <p><strong>Valid Until:</strong> ${formatDate(invitationDetails.expiresAt)}</p>
        </div>

        <p>
          <a href="${acceptUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This invitation will expire on ${formatDate(invitationDetails.expiresAt)}. Click the button above to accept and join the workspace.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This invitation was sent from Meetora. If you weren't expecting this, you can safely ignore this email.
        </p>
      `,
    };

    await this.sendEmail(mailOptions);
  }

  private async sendEmail(mailOptions: nodemailer.SendMailOptions) {
    const info = await this.transporter.sendMail(mailOptions);

    // For development (console mode), log the email
    if (this.configService.get('EMAIL_PROVIDER', 'console') === 'console') {
      console.log('📧 Email sent (console mode):');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('HTML:', mailOptions.html);
      console.log('---');
    }

    return info;
  }
}
