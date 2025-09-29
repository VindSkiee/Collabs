import nodemailer from "nodemailer";
import { ENV } from "../../../config/env.js";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,       // misal smtp.gmail.com
  port: ENV.SMTP_PORT || 587,
  secure: false,             // true jika pakai port 465
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export async function sendLoginSuccessEmail(toEmail, username) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Berhasil - Collabs</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          line-height: 1.6;
        }
        
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .tagline {
          font-size: 16px;
          opacity: 0.9;
          font-weight: 400;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .success-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1F2937;
          text-align: center;
          margin-bottom: 16px;
        }
        
        .greeting {
          font-size: 18px;
          color: #374151;
          text-align: center;
          margin-bottom: 32px;
        }
        
        .info-box {
          background: #F9FAFB;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 8px 0;
          font-size: 14px;
        }
        
        .info-label {
          color: #6B7280;
          font-weight: 500;
        }
        
        .info-value {
          color: #1F2937;
          font-weight: 600;
        }
        
        .security-notice {
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        
        .security-title {
          font-weight: 600;
          color: #92400E;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .security-text {
          color: #B45309;
          font-size: 14px;
          margin: 0;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 16px auto;
          display: block;
          text-align: center;
          max-width: 200px;
          transition: transform 0.2s;
        }
        
        .cta-button:hover {
          transform: translateY(-1px);
        }
        
        .footer {
          background: #F9FAFB;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #E5E7EB;
        }
        
        .footer-text {
          color: #6B7280;
          font-size: 12px;
          margin: 4px 0;
        }
        
        .social-links {
          margin: 16px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #9CA3AF;
          text-decoration: none;
          font-size: 12px;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 20px;
            border-radius: 12px;
          }
          
          .header, .content, .footer {
            padding: 24px 20px;
          }
          
          .title {
            font-size: 20px;
          }
          
          .greeting {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Collabs</div>
          <div class="tagline">Platform Kolaborasi Terdepan</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="success-icon">✓</div>
          
          <h1 class="title">Login Berhasil!</h1>
          
          <p class="greeting">Halo <strong>${username}</strong>,</p>
          
          <p style="color: #6B7280; text-align: center; margin-bottom: 24px;">
            Akun Anda berhasil login ke aplikasi Collabs. Selamat datang kembali!
          </p>
          
          <!-- Login Information -->
          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Waktu Login:</span>
              <span class="info-value">${currentDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${toEmail}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value" style="color: #10B981;">✓ Berhasil</span>
            </div>
          </div>
          
          <!-- Security Notice -->
          <div class="security-notice">
            <div class="security-title">🔐 Keamanan Akun</div>
            <p class="security-text">
              Jika Anda tidak melakukan login ini, segera amankan akun Anda dengan mengganti password atau hubungi tim support kami.
            </p>
          </div>
          
          <!-- CTA Button -->
          <a href="#" class="cta-button">Kelola Akun Saya</a>
          
          <p style="color: #9CA3AF; font-size: 13px; text-align: center; margin-top: 24px;">
            Terima kasih telah menggunakan Collabs untuk kolaborasi yang lebih baik!
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-text"><strong>Tim Collabs</strong></p>
          <p class="footer-text">Platform Kolaborasi untuk Semua</p>
          
          <div class="social-links">
            <a href="#">Website</a>
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
          </div>
          
          <p class="footer-text" style="margin-top: 16px;">
            © 2024 Collabs. Semua hak cipta dilindungi.
          </p>
          
          <p class="footer-text" style="font-size: 11px; margin-top: 8px;">
            Email ini dikirim otomatis, mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Collabs - Tim Keamanan" <${ENV.SMTP_USER}>`,
    to: toEmail,
    subject: "🔐 Login Berhasil - Collabs Platform",
    text: `Halo ${username},

Akun Anda berhasil login ke aplikasi Collabs pada ${currentDate}.

Detail Login:
- Email: ${toEmail}  
- Waktu: ${currentDate}
- Status: Berhasil

PENTING: Jika Anda tidak melakukan login ini, segera amankan akun Anda dengan mengganti password atau hubungi tim support kami.

Terima kasih telah menggunakan Collabs!

---
Tim Collabs
Platform Kolaborasi untuk Semua`,
    html: htmlTemplate,
  };

  return transporter.sendMail(mailOptions);
}
