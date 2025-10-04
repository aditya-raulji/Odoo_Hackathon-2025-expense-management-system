const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.senderEmail = process.env.SENDER_EMAIL;
    
    if (this.sendGridApiKey) {
      sgMail.setApiKey(this.sendGridApiKey);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.sendGridApiKey || !this.senderEmail) {
      console.log('📧 Email notification (SendGrid not configured):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${textContent || htmlContent}`);
      return { success: true, message: 'Email logged (SendGrid not configured)' };
    }

    try {
      const msg = {
        to: to,
        from: this.senderEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`📧 Email sent successfully to ${to}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('📧 Email sending failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  async notifyExpenseSubmitted(expense, approver) {
    const subject = `New Expense Submitted - ${expense.category}`;
    const textContent = `
Hello ${approver.name},

A new expense has been submitted and requires your approval.

Expense Details:
- Submitted by: ${expense.submitted_by_name}
- Category: ${expense.category}
- Amount: ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})
- Description: ${expense.description}
- Date: ${expense.expense_date}
- Submitted: ${new Date(expense.created_at).toLocaleDateString()}

Please review and approve/reject this expense in the system.

Best regards,
Expense Management System
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Expense Submitted</h2>
        <p>Hello ${approver.name},</p>
        <p>A new expense has been submitted and requires your approval.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #555;">Expense Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Submitted by:</strong> ${expense.submitted_by_name}</li>
            <li><strong>Category:</strong> ${expense.category}</li>
            <li><strong>Amount:</strong> ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})</li>
            <li><strong>Description:</strong> ${expense.description}</li>
            <li><strong>Date:</strong> ${expense.expense_date}</li>
            <li><strong>Submitted:</strong> ${new Date(expense.created_at).toLocaleDateString()}</li>
          </ul>
        </div>
        
        <p>Please review and approve/reject this expense in the system.</p>
        
        <p>Best regards,<br>Expense Management System</p>
      </div>
    `;

    return await this.sendEmail(approver.email, subject, htmlContent, textContent);
  }

  async notifyExpenseApproved(expense, submitter) {
    const subject = `Expense Approved - ${expense.category}`;
    const textContent = `
Hello ${submitter.name},

Your expense has been approved.

Expense Details:
- Category: ${expense.category}
- Amount: ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})
- Description: ${expense.description}
- Date: ${expense.expense_date}

The expense has been processed and will be included in your reimbursement.

Best regards,
Expense Management System
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Expense Approved</h2>
        <p>Hello ${submitter.name},</p>
        <p>Your expense has been approved.</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #155724;">Expense Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Category:</strong> ${expense.category}</li>
            <li><strong>Amount:</strong> ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})</li>
            <li><strong>Description:</strong> ${expense.description}</li>
            <li><strong>Date:</strong> ${expense.expense_date}</li>
          </ul>
        </div>
        
        <p>The expense has been processed and will be included in your reimbursement.</p>
        
        <p>Best regards,<br>Expense Management System</p>
      </div>
    `;

    return await this.sendEmail(submitter.email, subject, htmlContent, textContent);
  }

  async notifyExpenseRejected(expense, submitter, comments = '') {
    const subject = `Expense Rejected - ${expense.category}`;
    const textContent = `
Hello ${submitter.name},

Your expense has been rejected.

Expense Details:
- Category: ${expense.category}
- Amount: ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})
- Description: ${expense.description}
- Date: ${expense.expense_date}

${comments ? `Comments: ${comments}` : ''}

Please review the rejection reason and resubmit if necessary.

Best regards,
Expense Management System
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Expense Rejected</h2>
        <p>Hello ${submitter.name},</p>
        <p>Your expense has been rejected.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0; color: #721c24;">Expense Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Category:</strong> ${expense.category}</li>
            <li><strong>Amount:</strong> ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})</li>
            <li><strong>Description:</strong> ${expense.description}</li>
            <li><strong>Date:</strong> ${expense.expense_date}</li>
          </ul>
        </div>
        
        ${comments ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;"><strong>Comments:</strong> ${comments}</div>` : ''}
        
        <p>Please review the rejection reason and resubmit if necessary.</p>
        
        <p>Best regards,<br>Expense Management System</p>
      </div>
    `;

    return await this.sendEmail(submitter.email, subject, htmlContent, textContent);
  }

  async notifyNextApprover(expense, nextApprover) {
    const subject = `Expense Forwarded for Approval - ${expense.category}`;
    const textContent = `
Hello ${nextApprover.name},

An expense has been forwarded to you for approval.

Expense Details:
- Submitted by: ${expense.submitted_by_name}
- Category: ${expense.category}
- Amount: ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})
- Description: ${expense.description}
- Date: ${expense.expense_date}

Please review and approve/reject this expense in the system.

Best regards,
Expense Management System
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Expense Forwarded for Approval</h2>
        <p>Hello ${nextApprover.name},</p>
        <p>An expense has been forwarded to you for approval.</p>
        
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin-top: 0; color: #004085;">Expense Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Submitted by:</strong> ${expense.submitted_by_name}</li>
            <li><strong>Category:</strong> ${expense.category}</li>
            <li><strong>Amount:</strong> ${expense.currency} ${expense.amount} (${expense.company_currency} ${expense.converted_amount})</li>
            <li><strong>Description:</strong> ${expense.description}</li>
            <li><strong>Date:</strong> ${expense.expense_date}</li>
          </ul>
        </div>
        
        <p>Please review and approve/reject this expense in the system.</p>
        
        <p>Best regards,<br>Expense Management System</p>
      </div>
    `;

    return await this.sendEmail(nextApprover.email, subject, htmlContent, textContent);
  }

  // Create in-app notification
  async createInAppNotification(userId, title, message, type = 'info', actionUrl = null) {
    try {
      const UserNotification = require('../models/UserNotification');
      await UserNotification.create({
        userId,
        title,
        message,
        type,
        actionUrl
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to create in-app notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50) {
    try {
      const UserNotification = require('../models/UserNotification');
      return await UserNotification.findByUser(userId, limit);
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      const UserNotification = require('../models/UserNotification');
      return await UserNotification.markAsRead(notificationId, userId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
