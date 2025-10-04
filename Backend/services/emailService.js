const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  static async sendVerificationCodeEmail(email, name, verificationCode) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDER_EMAIL,
        name: 'ExMan System'
      },
      subject: 'Verify Your Email Address - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${name}!</h2>
          <p>Thank you for registering with ExMan. Please verify your email address using the verification code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 10px; padding: 20px; display: inline-block;">
              <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
          </div>
          <p>Enter this 6-digit code in the verification form to complete your registration.</p>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Verification code email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending verification code email:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDER_EMAIL,
        name: 'Auth System'
      },
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Password reset email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeEmail(email, name) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDER_EMAIL,
        name: 'Auth System'
      },
      subject: 'Welcome! Your account is now verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Welcome ${name}!</h2>
          <p>Your email has been successfully verified. You can now access all features of our service.</p>
          <p>Thank you for joining us!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you have any questions, feel free to contact our support team.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Welcome email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
