import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, title, description, userEmail, userName } = req.body;

  if (!title || !description || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const typeLabel = type === 'bug' ? '🐛 Bug Report' : type === 'feature' ? '💡 Feature Request' : '💬 Feedback';

  try {
    // Email to admin
    await transporter.sendMail({
      from: `"Dev Tracker" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Dev Tracker] ${typeLabel}: ${title}`,
      html: `
        <div style="font-family:monospace;background:#0a0a0f;color:#e4e4e7;padding:30px;border-radius:12px;">
          <h2 style="color:#667eea;margin:0 0 8px;">Dev Tracker — New ${typeLabel}</h2>
          <p style="color:#71717a;font-size:12px;margin:0 0 20px;">From: ${userName} (${userEmail})</p>
          <div style="background:#111118;padding:16px;border-radius:8px;border:1px solid #1e1e2e;">
            <p style="color:#667eea;font-size:14px;font-weight:bold;margin:0 0 8px;">${title}</p>
            <p style="color:#a1a1aa;font-size:12px;line-height:1.6;margin:0;white-space:pre-wrap;">${description}</p>
          </div>
          <p style="color:#52525b;font-size:10px;margin:20px 0 0;">Type: ${typeLabel} | Date: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    // Confirmation email to user
    await transporter.sendMail({
      from: `"Dev Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Thanks for your feedback! — Dev Tracker`,
      html: `
        <div style="font-family:monospace;background:#0a0a0f;color:#e4e4e7;padding:30px;border-radius:12px;">
          <h2 style="color:#667eea;margin:0 0 8px;">Thanks for your feedback! 🙏</h2>
          <p style="color:#a1a1aa;font-size:12px;margin:0 0 16px;">Hi ${userName || 'Developer'},</p>
          <p style="color:#a1a1aa;font-size:12px;line-height:1.6;margin:0 0 16px;">We received your ${typeLabel.toLowerCase()}:</p>
          <div style="background:#111118;padding:16px;border-radius:8px;border:1px solid #1e1e2e;">
            <p style="color:#fff;font-size:13px;font-weight:bold;margin:0 0 6px;">${title}</p>
            <p style="color:#71717a;font-size:11px;margin:0;">${description.slice(0, 200)}${description.length > 200 ? '...' : ''}</p>
          </div>
          <p style="color:#43e97b;font-size:12px;margin:16px 0 0;">We'll look into it and get back to you soon!</p>
          <p style="color:#52525b;font-size:10px;margin:16px 0 0;">— Dev Tracker Team</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
