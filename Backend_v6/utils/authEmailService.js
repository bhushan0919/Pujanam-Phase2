const { BrevoClient } = require('@getbrevo/brevo');

class AuthEmailService {
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

  async sendRegistrationOtpEmail({ to, name, otp, expiresInMinutes = 5 }) {
    try {
      await this._send({
        to, toName: name, subject: 'Verify Your Email - Pujanam',
        html: `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;background:#f7f7f7;color:#222;margin:0;padding:0}
          .container{max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8}
          .header{background:linear-gradient(135deg,#eb8807 0%,#c96a00 100%);color:#fff;padding:24px;text-align:center}
          .content{padding:28px;line-height:1.6}
          .otp{font-size:34px;letter-spacing:8px;font-weight:700;text-align:center;background:#fff3e0;color:#8a4d00;border-radius:14px;padding:16px 20px;margin:24px 0;border:1px dashed #eb8807}
          .footer{padding:20px 28px;color:#777;font-size:12px;border-top:1px solid #eee}
        </style></head><body>
          <div class="container">
            <div class="header"><h1 style="margin:0;font-size:24px;">🙏 Pujanam</h1></div>
            <div class="content">
              <p>Hi ${name || 'there'},</p>
              <p>Use the verification code below to complete your registration:</p>
              <div class="otp">${otp}</div>
              <p>This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
              <p style="font-size:13px;color:#888;">If you did not request this, you can safely ignore this email.</p>
            </div>
            <div class="footer"><p>© ${new Date().getFullYear()} Pujanam. All rights reserved.</p></div>
          </div>
        </body></html>`
      });
      console.log(`📧 OTP email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ OTP email error:', error?.body || error.message);
      return false;
    }
  }

  async sendWelcomeEmail({ to, name }) {
    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      await this._send({
        to, toName: name, subject: 'Welcome to Pujanam!',
        html: `<!DOCTYPE html><html><body>
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
            <div style="background:linear-gradient(135deg,#eb8807,#c96a00);color:#fff;padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1>🙏 Welcome to Pujanam</h1>
              <p style="margin:8px 0 0">Your registration was successful</p>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
              <p>Dear ${name || 'there'},</p>
              <p>Thank you for joining <strong>Pujanam</strong>. Your account is now ready.</p>
              <div style="background:#fff8ee;border-left:4px solid #eb8807;padding:16px;border-radius:8px;margin:20px 0">
                <strong>What you can do next:</strong>
                <ul style="margin:10px 0 0 18px">
                  <li>Browse services and book a Pandit</li>
                  <li>Explore puja packages and offerings</li>
                  <li>Access astrology and consultation services</li>
                </ul>
              </div>
              <p style="text-align:center">
                <a href="${frontendUrl}/services" style="display:inline-block;background:#eb8807;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700">View Our Services</a>
              </p>
            </div>
            <p style="text-align:center;font-size:12px;color:#777;margin-top:16px">© ${new Date().getFullYear()} Pujanam. All rights reserved.</p>
          </div>
        </body></html>`
      });
      console.log(`📧 Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Welcome email error:', error?.body || error.message);
      return false;
    }
  }
}

module.exports = new AuthEmailService();