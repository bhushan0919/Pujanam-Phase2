const { BrevoClient } = require('@getbrevo/brevo');

class EmailService {
  constructor() {
  this.fromEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
  this.fromName = process.env.EMAIL_FROM_NAME || 'Pujanam';
  console.log('✅ AuthEmailService initialized');
}

async _send({ to, toName, subject, html }) {
  const { BrevoClient } = require('@getbrevo/brevo');
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  return client.transactionalEmails.sendTransacEmail({
    sender: { name: this.fromName, email: this.fromEmail },
    to: [{ email: to, name: toName || 'User' }],
    subject,
    htmlContent: html,
  });
}

  async sendPasswordResetEmail(to, resetCode, name) {
    try {
      await this._send({
        to, toName: name, subject: 'Password Reset Request - Pujanam',
        html: `<!DOCTYPE html><html><body>
          <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif">
            <div style="background:#eb8807;color:white;padding:16px;text-align:center;border-radius:8px 8px 0 0"><h2>Pujanam</h2></div>
            <div style="background:#fff;padding:28px;border:1px solid #eee;border-radius:0 0 8px 8px">
              <p>Dear ${name || 'User'},</p>
              <p>Use the code below to reset your password:</p>
              <div style="font-size:32px;font-weight:bold;text-align:center;letter-spacing:5px;background:#f0f0f0;padding:15px;border-radius:8px;margin:20px 0">${resetCode}</div>
              <p>This code expires in <strong>1 hour</strong>.</p>
              <p style="color:#ff9800;font-size:13px">⚠️ Never share this code with anyone.</p>
            </div>
            <p style="text-align:center;font-size:12px;color:#666">© ${new Date().getFullYear()} Pujanam. All rights reserved.</p>
          </div>
        </body></html>`
      });
      console.log(`📧 Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Password reset email error:', error?.body || error.message);
      return false;
    }
  }

  async sendContactAutoReply(to, name, userMessage) {
    try {
      await this._send({
        to, toName: name, subject: 'We received your message - Pujanam',
        html: `<!DOCTYPE html><html><body>
          <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0"><h2>🙏 Namaste ${name}</h2></div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px">
              <p>Thank you for reaching out to Pujanam.</p>
              <p>We have received your message and will get back to you within 24 hours.</p>
              <div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:20px 0">
                <strong>Your message:</strong>
                <p>${userMessage.substring(0, 200)}${userMessage.length > 200 ? '...' : ''}</p>
              </div>
              <p>If urgent, call us at <strong>+91 9373120370</strong>.</p>
              <p>Reference ID: <strong>${Date.now().toString().slice(-8)}</strong></p>
            </div>
            <p style="text-align:center;font-size:12px;color:#666">© ${new Date().getFullYear()} Pujanam. All rights reserved.</p>
          </div>
        </body></html>`
      });
      console.log(`📧 Auto-reply sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Auto-reply email error:', error?.body || error.message);
      return false;
    }
  }

  async sendContactReply(to, name, adminReply, originalMessage) {
    try {
      await this._send({
        to, toName: name, subject: 'Response to your inquiry - Pujanam',
        html: `<!DOCTYPE html><html><body>
          <div style="max-width:500px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f9f9f9">
            <div style="background:linear-gradient(135deg,#28a745,#20c997);color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0"><h2>Response from Pujanam Team</h2></div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px">
              <p>Dear ${name},</p>
              <div style="background:#e8f5e9;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #28a745">
                <strong>📝 Our Response:</strong>
                <p>${adminReply}</p>
              </div>
              <div style="background:#f5f5f5;padding:15px;border-radius:8px;font-size:13px">
                <strong>Your original message:</strong>
                <p>${originalMessage.substring(0, 300)}${originalMessage.length > 300 ? '...' : ''}</p>
              </div>
              <p>🙏 Thank you for choosing Pujanam.</p>
            </div>
            <p style="text-align:center;font-size:12px;color:#666">© ${new Date().getFullYear()} Pujanam. All rights reserved.</p>
          </div>
        </body></html>`
      });
      console.log(`📧 Reply sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Contact reply error:', error?.body || error.message);
      return false;
    }
  }
}

module.exports = new EmailService();