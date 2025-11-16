import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
}

interface ScrapingReport {
  type: 'manual' | 'scheduled';
  success: boolean;
  totalChannels: number;
  totalJobsExtracted: number;
  totalMessagesProcessed: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
  duration: string;
  sessionId?: string;
}

/**
 * Get all superadmin email addresses
 */
export async function getSuperadminEmails(): Promise<string[]> {
  try {
    const db = admin.firestore();
    const superadminsSnapshot = await db
      .collection('users')
      .where('role', '==', 'superadmin')
      .get();

    const emails = superadminsSnapshot.docs
      .map(doc => doc.data().email)
      .filter(email => email && typeof email === 'string');

    functions.logger.info(`📧 Found ${emails.length} superadmin emails`);
    return emails;
  } catch (error) {
    functions.logger.error('Failed to fetch superadmin emails:', error);
    return [];
  }
}

/**
 * Create email transporter using Gmail SMTP
 */
function createTransporter() {
  // Using Gmail SMTP with app password
  // You'll need to configure these in Firebase secrets
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Email credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD secrets.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

/**
 * Generate HTML report for scraping results
 */
function generateScrapingReportHTML(report: ScrapingReport): string {
  const statusColor = report.success ? '#10b981' : '#ef4444';
  const statusIcon = report.success ? '✅' : '❌';
  const statusText = report.success ? 'Completed Successfully' : 'Failed';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #F4C430;
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 6px;
      background-color: ${statusColor};
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
    }
    .stat-card {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #F4C430;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .detail-label {
      color: #6b7280;
      font-weight: 500;
    }
    .detail-value {
      color: #1a1a1a;
      font-weight: 600;
    }
    .errors {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .error-item {
      color: #991b1b;
      font-size: 14px;
      margin: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    .error-item:before {
      content: '•';
      position: absolute;
      left: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #6b7280;
      font-size: 13px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-manual {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-scheduled {
      background-color: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐝 NibJobs</div>
      <h1 style="margin: 10px 0; color: #1a1a1a;">Scraping Report</h1>
      <span class="badge ${report.type === 'manual' ? 'badge-manual' : 'badge-scheduled'}">
        ${report.type === 'manual' ? '🔧 Manual' : '⏰ Scheduled'}
      </span>
    </div>

    <div style="text-align: center;">
      <div class="status">
        ${statusIcon} ${statusText}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Jobs Extracted</div>
        <div class="stat-value">${report.totalJobsExtracted}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Channels Processed</div>
        <div class="stat-value">${report.totalChannels}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Messages Processed</div>
        <div class="stat-value">${report.totalMessagesProcessed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Duration</div>
        <div class="stat-value" style="font-size: 18px;">${report.duration}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 Details</div>
      <div class="detail-row">
        <span class="detail-label">Started At</span>
        <span class="detail-value">${report.startedAt.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Completed At</span>
        <span class="detail-value">${report.completedAt.toLocaleString()}</span>
      </div>
      ${report.sessionId ? `
      <div class="detail-row">
        <span class="detail-label">Session ID</span>
        <span class="detail-value" style="font-family: monospace; font-size: 12px;">${report.sessionId}</span>
      </div>
      ` : ''}
    </div>

    ${report.errors.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Errors (${report.errors.length})</div>
      <div class="errors">
        ${report.errors.slice(0, 10).map(error => `
          <div class="error-item">${error}</div>
        `).join('')}
        ${report.errors.length > 10 ? `
          <div class="error-item" style="font-style: italic;">
            ... and ${report.errors.length - 10} more errors
          </div>
        ` : ''}
      </div>
    </div>
    ` : `
    <div class="section">
      <div style="text-align: center; padding: 20px; background-color: #f0fdf4; border-radius: 6px;">
        <span style="font-size: 16px; color: #15803d;">
          ✨ No errors encountered during scraping
        </span>
      </div>
    </div>
    `}

    <div class="footer">
      <p>This is an automated report from NibJobs Telegram Scraper</p>
      <p style="margin-top: 5px;">
        Generated on ${new Date().toLocaleString()}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Calculate duration between two dates
 */
function formatDuration(startDate: Date, endDate: Date): string {
  const durationMs = endDate.getTime() - startDate.getTime();
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Send scraping report email to superadmins
 */
export async function sendScrapingReport(
  report: Omit<ScrapingReport, 'duration'>
): Promise<void> {
  try {
    const superadminEmails = await getSuperadminEmails();

    if (superadminEmails.length === 0) {
      functions.logger.warn('No superadmin emails found to send report');
      return;
    }

    const duration = formatDuration(report.startedAt, report.completedAt);
    const fullReport: ScrapingReport = { ...report, duration };

    const subject = `[NibJobs] ${report.success ? '✅' : '❌'} ${
      report.type === 'manual' ? 'Manual' : 'Scheduled'
    } Scraping ${report.success ? 'Completed' : 'Failed'} - ${
      fullReport.totalJobsExtracted
    } Jobs Extracted`;

    const html = generateScrapingReportHTML(fullReport);

    const transporter = createTransporter();

    const mailOptions: EmailOptions = {
      to: superadminEmails,
      subject,
      html,
    };

    // Send email to all superadmins
    await transporter.sendMail({
      from: `"NibJobs Scraper" <${process.env.GMAIL_USER}>`,
      to: mailOptions.to.join(', '),
      subject: mailOptions.subject,
      html: mailOptions.html,
    });

    functions.logger.info(
      `📧 Scraping report sent to ${superadminEmails.length} superadmin(s)`
    );
  } catch (error) {
    functions.logger.error('Failed to send scraping report email:', error);
    // Don't throw - we don't want email failures to crash the scraping
  }
}

/**
 * Generate HTML for role change notification
 */
function generateRoleChangeHTML(userName: string, oldRole: string, newRole: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #F4C430;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .badge-old {
      background-color: #fee;
      color: #c33;
    }
    .badge-new {
      background-color: #efe;
      color: #3c3;
    }
    .content {
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐝 NibJobs</div>
      <h2 style="margin: 0; color: #333;">Role Changed</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your account role has been updated by an administrator.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span class="badge badge-old">${oldRole}</span>
        <span style="margin: 0 10px;">→</span>
        <span class="badge badge-new">${newRole}</span>
      </div>
      <p>This change may affect your access permissions and available features.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} NibJobs. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for subscription change notification
 */
function generateSubscriptionChangeHTML(userName: string, oldPlan: string, newPlan: string): string {
  const planColors: Record<string, string> = {
    free: '#808080',
    standard: '#F4C430',
    enterprise: '#1A365D'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #F4C430;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      text-transform: capitalize;
      color: white;
      font-size: 16px;
    }
    .content {
      margin: 20px 0;
    }
    .highlight-box {
      background-color: #f9fafb;
      border-left: 4px solid #F4C430;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐝 NibJobs</div>
      <h2 style="margin: 0; color: #333;">Subscription Updated</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Great news! Your subscription plan has been updated.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span class="badge" style="background-color: ${planColors[oldPlan] || '#808080'}; opacity: 0.6;">${oldPlan}</span>
        <span style="margin: 0 10px; font-size: 24px;">→</span>
        <span class="badge" style="background-color: ${planColors[newPlan] || '#808080'};">${newPlan}</span>
      </div>
      <div class="highlight-box">
        <p style="margin: 0;"><strong>🎉 You now have access to:</strong></p>
        <ul style="margin: 10px 0;">
          ${newPlan === 'enterprise' ? `
            <li>Unlimited job postings</li>
            <li>Featured company profile</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>Custom branding</li>
          ` : newPlan === 'standard' ? `
            <li>Unlimited custom job notifications</li>
            <li>Post job ads</li>
            <li>Basic analytics</li>
            <li>Email support</li>
          ` : `
            <li>3 custom job notifications per day</li>
            <li>Basic job search and browsing</li>
          `}
        </ul>
      </div>
      <p>Log in to your account to explore your new features!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} NibJobs. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send role change notification email
 */
export async function sendRoleChangeEmail(
  userEmail: string,
  userName: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  try {
    const transporter = createTransporter();
    const html = generateRoleChangeHTML(userName, oldRole, newRole);

    await transporter.sendMail({
      from: `"NibJobs" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Your NibJobs Role Has Been Updated to ${newRole}`,
      html,
    });

    functions.logger.info(`📧 Role change email sent to ${userEmail}`);
  } catch (error) {
    functions.logger.error('Failed to send role change email:', error);
    throw error;
  }
}

/**
 * Send subscription change notification email
 */
export async function sendSubscriptionChangeEmail(
  userEmail: string,
  userName: string,
  oldPlan: string,
  newPlan: string
): Promise<void> {
  try {
    const transporter = createTransporter();
    const html = generateSubscriptionChangeHTML(userName, oldPlan, newPlan);

    await transporter.sendMail({
      from: `"NibJobs" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Your NibJobs Subscription Has Been Updated to ${newPlan}`,
      html,
    });

    functions.logger.info(`📧 Subscription change email sent to ${userEmail}`);
  } catch (error) {
    functions.logger.error('Failed to send subscription change email:', error);
    throw error;
  }
}
