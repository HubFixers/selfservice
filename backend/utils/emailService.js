const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initializeTransporter() {
    try {
      const settings = await Settings.findOne();
      
      if (!settings || !settings.emailConfig.enabled || !settings.emailConfig.smtpUser) {
        console.log('Email service not configured or disabled');
        return false;
      }

      this.transporter = nodemailer.createTransporter({
        host: settings.emailConfig.smtpHost,
        port: settings.emailConfig.smtpPort,
        secure: settings.emailConfig.smtpSecure,
        auth: {
          user: settings.emailConfig.smtpUser,
          pass: settings.emailConfig.smtpPass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error.message);
      return false;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized) {
          throw new Error('Email service not available');
        }
      }

      const settings = await Settings.findOne();
      const fromEmail = settings.emailConfig.fromEmail;
      const fromName = settings.emailConfig.fromName;

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  replaceTemplateVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  async sendBookingConfirmation(booking, settings) {
    try {
      if (!settings.emailTemplates.bookingConfirmation.enabled) {
        return { success: false, error: 'Booking confirmation emails disabled' };
      }

      const variables = {
        customerName: booking.customerName,
        bookingId: booking._id,
        serviceName: booking.service.name,
        servicePrice: booking.serviceRate,
        priceUnit: booking.service.priceUnit,
        hoursNeeded: booking.hoursNeeded,
        totalAmount: booking.totalAmount,
        bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
        bookingTime: booking.bookingTime,
        retainerAmount: booking.retainerAmount,
        businessName: settings.businessInfo.name,
        businessEmail: settings.businessInfo.email,
        businessPhone: settings.businessInfo.phone,
        cashApp: settings.paymentInstructions.cashApp,
        paypal: settings.paymentInstructions.paypal
      };

      const subject = this.replaceTemplateVariables(
        settings.emailTemplates.bookingConfirmation.subject,
        variables
      );

      const htmlContent = this.generateBookingConfirmationHTML(variables);

      return await this.sendEmail(booking.customerEmail, subject, htmlContent);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentConfirmation(booking, settings) {
    try {
      if (!settings.emailTemplates.paymentConfirmation.enabled) {
        return { success: false, error: 'Payment confirmation emails disabled' };
      }

      const variables = {
        customerName: booking.customerName,
        bookingId: booking._id,
        serviceName: booking.service.name,
        bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
        bookingTime: booking.bookingTime,
        retainerAmount: booking.retainerAmount,
        businessName: settings.businessInfo.name,
        businessEmail: settings.businessInfo.email,
        businessPhone: settings.businessInfo.phone
      };

      const subject = this.replaceTemplateVariables(
        settings.emailTemplates.paymentConfirmation.subject,
        variables
      );

      const htmlContent = this.generatePaymentConfirmationHTML(variables);

      return await this.sendEmail(booking.customerEmail, subject, htmlContent);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBookingReminder(booking, settings) {
    try {
      if (!settings.emailTemplates.bookingReminder.enabled) {
        return { success: false, error: 'Booking reminder emails disabled' };
      }

      const variables = {
        customerName: booking.customerName,
        serviceName: booking.service.name,
        bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
        bookingTime: booking.bookingTime,
        businessName: settings.businessInfo.name,
        businessEmail: settings.businessInfo.email,
        businessPhone: settings.businessInfo.phone,
        businessAddress: settings.businessInfo.address
      };

      const subject = this.replaceTemplateVariables(
        settings.emailTemplates.bookingReminder.subject,
        variables
      );

      const htmlContent = this.generateBookingReminderHTML(variables);

      return await this.sendEmail(booking.customerEmail, subject, htmlContent);
    } catch (error) {
      console.error('Error sending booking reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async sendContactNotification(contact, settings) {
    try {
      const variables = {
        customerName: contact.name,
        customerEmail: contact.email,
        message: contact.message,
        submittedAt: new Date(contact.createdAt).toLocaleString(),
        businessName: settings.businessInfo.name
      };

      const subject = `New Contact Form Submission from ${contact.name}`;
      const htmlContent = this.generateContactNotificationHTML(variables);

      // Send to business email
      return await this.sendEmail(settings.businessInfo.email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending contact notification:', error);
      return { success: false, error: error.message };
    }
  }

  generateBookingConfirmationHTML(vars) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .payment-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Thank you for your booking with ${vars.businessName}!</p>
        </div>
        
        <div class="content">
          <p>Dear ${vars.customerName},</p>
          
          <p>We're excited to confirm your booking! Here are the details:</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span>${vars.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span>${vars.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${vars.bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${vars.bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service Rate:</span>
              <span>$${vars.servicePrice}/${vars.priceUnit}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <h3>⚠️ Payment Required</h3>
            <p>To secure your booking, please send the retainer amount of <strong>$${vars.retainerAmount}</strong> using one of the following methods:</p>
            
            <p><strong>CashApp:</strong> ${vars.cashApp}</p>
            <p><strong>PayPal:</strong> ${vars.paypal}</p>
            
            <p>Once payment is received, we'll send you a confirmation email with your receipt.</p>
          </div>
          
          <p>If you have any questions or need to make changes to your booking, please contact us:</p>
          <p>📧 Email: ${vars.businessEmail}<br>
             📞 Phone: ${vars.businessPhone}</p>
          
          <p>We look forward to serving you!</p>
          
          <p>Best regards,<br>
             The ${vars.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  generatePaymentConfirmationHTML(vars) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .success-info { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Payment Confirmed!</h1>
          <p>Your booking is now secured</p>
        </div>
        
        <div class="content">
          <p>Dear ${vars.customerName},</p>
          
          <p>Great news! We've received and confirmed your payment. Your booking is now officially secured.</p>
          
          <div class="success-info">
            <h3>✅ Payment Processed Successfully</h3>
            <p>Amount: <strong>$${vars.retainerAmount}</strong></p>
            <p>Status: <strong>PAID</strong></p>
          </div>
          
          <div class="booking-details">
            <h3>Your Confirmed Booking</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span>${vars.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span>${vars.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${vars.bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${vars.bookingTime}</span>
            </div>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>We'll send you a reminder email 24 hours before your appointment</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            <li>Please arrive 5-10 minutes early for your appointment</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <p>📧 Email: ${vars.businessEmail}<br>
             📞 Phone: ${vars.businessPhone}</p>
          
          <p>Thank you for choosing ${vars.businessName}!</p>
          
          <p>Best regards,<br>
             The ${vars.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateBookingReminderHTML(vars) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .reminder-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
          <p>Your appointment is coming up soon!</p>
        </div>
        
        <div class="content">
          <p>Dear ${vars.customerName},</p>
          
          <p>This is a friendly reminder about your upcoming appointment with ${vars.businessName}.</p>
          
          <div class="appointment-details">
            <h3>Appointment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span>${vars.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${vars.bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${vars.bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span>${vars.businessAddress}</span>
            </div>
          </div>
          
          <div class="reminder-info">
            <h3>📋 Important Reminders</h3>
            <ul>
              <li>Please arrive 5-10 minutes early</li>
              <li>Bring any necessary documents or materials</li>
              <li>If you need to reschedule, please contact us as soon as possible</li>
            </ul>
          </div>
          
          <p>If you have any questions or need to make changes, please contact us:</p>
          <p>📧 Email: ${vars.businessEmail}<br>
             📞 Phone: ${vars.businessPhone}</p>
          
          <p>We look forward to seeing you!</p>
          
          <p>Best regards,<br>
             The ${vars.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateContactNotificationHTML(vars) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .contact-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; display: block; margin-bottom: 5px; }
          .message-content { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 New Contact Form Submission</h1>
          <p>Someone has contacted ${vars.businessName}</p>
        </div>
        
        <div class="content">
          <p>You have received a new message through your website contact form.</p>
          
          <div class="contact-details">
            <h3>Contact Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span>${vars.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span>${vars.customerEmail}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submitted:</span>
              <span>${vars.submittedAt}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Message:</span>
              <div class="message-content">
                ${vars.message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <p>Please respond to this inquiry as soon as possible.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from your website contact form.</p>
        </div>
      </body>
      </html>
    `;
  }

  async testEmailConfiguration() {
    try {
      const initialized = await this.initializeTransporter();
      if (!initialized) {
        return { success: false, error: 'Failed to initialize email service' };
      }

      const settings = await Settings.findOne();
      const testEmail = settings.emailConfig.smtpUser;

      const result = await this.sendEmail(
        testEmail,
        'Email Configuration Test',
        '<h1>Test Email</h1><p>Your email configuration is working correctly!</p>',
        'Test Email - Your email configuration is working correctly!'
      );

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();