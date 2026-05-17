const { Resend } = require('resend');

let _resend = null;
const getResend = () => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const buildShopUrl = (slug) => `${FRONTEND_URL}/s/${slug}`;
const buildAdminUrl = (slug) => `${FRONTEND_URL}/s/${slug}/admin/login`;

// ─── Shared URL block used in multiple emails ─────────────────────────────────
const buildUrlBlock = (shopUrl, adminUrl) => `
  <div style="background: #f5f3ff; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
    <p style="font-size: 0.8rem; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">🌐 Your Public Shop URL</p>
    <a href="${shopUrl}" style="font-size: 1rem; font-weight: 600; color: #6d28d9; word-break: break-all;">${shopUrl}</a>
    <div style="border-top: 1px solid #ddd6fe; margin: 16px 0;"></div>
    <p style="font-size: 0.8rem; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">🔐 Your Admin Login URL</p>
    <a href="${adminUrl}" style="font-size: 1rem; font-weight: 600; color: #6d28d9; word-break: break-all;">${adminUrl}</a>
  </div>
`;

// ─── Email 1: Welcome + Shop Live (Auto-Signup) ───────────────────────────────
const sendWelcomeEmail = async ({ to, ownerName, businessName, slug, isPaid = false }) => {
  const shopUrl = buildShopUrl(slug);
  const adminUrl = buildAdminUrl(slug);

  const subscriptionNote = isPaid
    ? `<p style="margin-top: 24px; font-size: 0.875rem; color: #059669;">✅ Your subscription is active.</p>`
    : `<p style="margin-top: 24px; font-size: 0.875rem; color: #999;">You have a 7-day free trial. Upgrade anytime from your dashboard before it expires.</p>`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🎉 Your ${businessName} store is live on ArtSpace!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Welcome, ${ownerName}! 🎉</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Your <strong>${businessName}</strong> store is live and ready to share with your customers.
          Save both URLs below — you'll need them to manage your shop.
        </p>

        ${buildUrlBlock(shopUrl, adminUrl)}

        <a href="${adminUrl}"
           style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-bottom: 24px;">
          Go to Dashboard →
        </a>

        ${subscriptionNote}

        <p style="margin-top: 32px; font-size: 0.8rem; color: #999;">
          Share your public shop URL with customers on WhatsApp, Instagram, or anywhere you promote your business.
        </p>
      </div>
    `,
  });

  if (error) { console.error('❌ Welcome email error:', error); throw error; }
  return data;
};

// ─── Email 2: Credentials Email (Super Admin creates tenant — Option B) ────────
const sendCredentialsEmail = async ({ to, ownerName, businessName, slug, initialPassword }) => {
  const shopUrl = buildShopUrl(slug);
  const adminUrl = buildAdminUrl(slug);

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${businessName} store has been created on ArtSpace`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Your store is ready, ${ownerName}!</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Your <strong>${businessName}</strong> store has been set up on ArtSpace.
          Here are your login credentials — please change your password after first login.
        </p>

        <div style="background: #f5f3ff; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 0.8rem; color: #7c3aed; font-weight: 600; margin: 0 0 12px;">🔑 Your Login Credentials</p>
          <p style="margin: 0 0 6px; font-size: 0.95rem;"><span style="color: #888;">Email:</span> <strong>${to}</strong></p>
          <p style="margin: 0 0 0; font-size: 0.95rem;"><span style="color: #888;">Password:</span> <strong>${initialPassword}</strong></p>
        </div>

        ${buildUrlBlock(shopUrl, adminUrl)}

        <a href="${adminUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          Login to Dashboard →
        </a>

        <p style="margin-top: 24px; font-size: 0.875rem; color: #f59e0b;">⚠️ Please change your password immediately after logging in.</p>
      </div>
    `,
  });

  if (error) { console.error('❌ Credentials email error:', error); throw error; }
  return data;
};

// ─── Email 3: Welcome + Shop Live (Super Admin manually activates — Option A) ──
const sendManualApprovalEmail = async ({ to, ownerName, businessName, slug }) => {
  const shopUrl = buildShopUrl(slug);
  const adminUrl = buildAdminUrl(slug);

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✅ Your ${businessName} store is now live!`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Your store is live, ${ownerName}!</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Your <strong>${businessName}</strong> store has been activated and is now live.
        </p>

        ${buildUrlBlock(shopUrl, adminUrl)}

        <a href="${adminUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          Go to Dashboard →
        </a>
      </div>
    `,
  });

  if (error) { console.error('❌ Manual approval email error:', error); throw error; }
  return data;
};

// ─── Email 4: Password Reset ──────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, ownerName, resetUrl }) => {
  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your ArtSpace password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Reset your password</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Hi ${ownerName}, we received a request to reset your password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          Reset Password →
        </a>
        <p style="margin-top: 32px; font-size: 0.875rem; color: #999;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) { console.error('❌ Password reset email error:', error); throw error; }
  return data;
};

// ─── Email 5: Slug Changed Notification ──────────────────────────────────────
const sendSlugChangedEmail = async ({ to, ownerName, businessName, newSlug }) => {
  const shopUrl = buildShopUrl(newSlug);
  const adminUrl = buildAdminUrl(newSlug);

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${businessName} shop URL has been updated`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Your shop URL has changed</h1>
        <p style="color: #555; margin-bottom: 24px;">
          Hi ${ownerName}, your <strong>${businessName}</strong> shop URL was just updated.
          Your old URL no longer works — please save these new URLs and share the updated shop link with your customers.
        </p>

        ${buildUrlBlock(shopUrl, adminUrl)}

        <a href="${adminUrl}"
           style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-bottom: 24px;">
          Login with New URL →
        </a>

        <p style="margin-top: 16px; font-size: 0.8rem; color: #ef4444;">
          ⚠️ Remember to update any links you've shared on WhatsApp, Instagram, or other platforms.
        </p>

        <p style="margin-top: 8px; font-size: 0.8rem; color: #999;">
          If you didn't make this change, please contact support immediately.
        </p>
      </div>
    `,
  });

  if (error) { console.error('❌ Slug changed email error:', error); throw error; }
  return data;
};

module.exports = {
  sendWelcomeEmail,
  sendCredentialsEmail,
  sendManualApprovalEmail,
  sendPasswordResetEmail,
  sendSlugChangedEmail,
};