export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv ? secureEnv === 'true' : port === 465;

  if (!host || !port || !user || !pass) {
    return { transporter: null, error: 'SMTP credentials missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS' };
  }

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return { transporter };
}

// Brand colors aligned with src/app/globals.css. Can be overridden via env vars.
function getBrandColors() {
  return {
    background: process.env.BRAND_BACKGROUND || '#ffffff',
    foreground: process.env.BRAND_FOREGROUND || '#333333',
    primary: process.env.BRAND_PRIMARY || '#1E88E5',
    primaryLight: process.env.BRAND_PRIMARY_LIGHT || '#64B5F6',
    primaryDark: process.env.BRAND_PRIMARY_DARK || '#1565C0',
    secondary: process.env.BRAND_SECONDARY || '#4CAF50',
    grayLight: process.env.BRAND_GRAY_LIGHT || '#F5F5F5',
    grayMedium: process.env.BRAND_GRAY_MEDIUM || '#E0E0E0',
    textPrimary: process.env.BRAND_TEXT_PRIMARY || '#333333',
    textSecondary: process.env.BRAND_TEXT_SECONDARY || '#757575',
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate a responsive, inline-styled HTML email using brand colors
function generateEmailTemplate({
  subject = '',
  preview = '',
  title = '',
  greeting = '',
  bodyHtml = '',
  bodyText = '',
  bulletPoints = [],
  ctaUrl = '',
  ctaLabel = 'Ouvrir',
  footer = 'Cet email vous est envoyé par MaterniBénin.',
  logoUrl = '',
  brandName = process.env.EMAIL_FROM_NAME || 'MaterniBénin',
} = {}) {
  const c = getBrandColors();

  const safeTitle = escapeHtml(title || subject);
  const safeGreeting = escapeHtml(greeting);
  const safeText = escapeHtml(bodyText);
  const bullets = Array.isArray(bulletPoints) ? bulletPoints : [];

  const bulletsHtml = bullets
    .map((b) => `<li style="margin: 0 0 8px 0; color: ${c.textSecondary}; line-height: 1.6;">${escapeHtml(b)}</li>`)
    .join('');

  const buttonHtml = ctaUrl
    ? `<a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:12px 20px; background:${c.primary}; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">
         ${escapeHtml(ctaLabel)}
       </a>`
    : '';

  const headerBrand = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName)}" width="140" style="display:block; max-width:140px; height:auto;" />`
    : `<span style="font-size:20px; font-weight:700; color:#ffffff;">${escapeHtml(brandName)}</span>`;

  const contentBlock = bodyHtml
    ? bodyHtml
    : `
      ${safeGreeting ? `<p style="margin:0 0 12px 0; color:${c.textPrimary}; line-height:1.6;">${safeGreeting}</p>` : ''}
      ${safeText ? `<p style="margin:0 0 12px 0; color:${c.textSecondary}; line-height:1.7;">${safeText}</p>` : ''}
      ${bulletsHtml ? `<ul style="padding-left:18px; margin:0 0 12px 0;">${bulletsHtml}</ul>` : ''}
      ${buttonHtml ? `<div style="margin-top:16px;">${buttonHtml}</div>` : ''}
    `;

  return `<!doctype html>
  <html lang="fr">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${safeTitle}</title>
      <meta name="color-scheme" content="light only" />
      ${preview ? `<style>.preheader{display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;}</style>` : ''}
    </head>
    <body style="margin:0; padding:0; background:${c.grayLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;">
      ${preview ? `<div class="preheader">${escapeHtml(preview)}</div>` : ''}
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${c.grayLight};">
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${c.primary};">
              <tr>
                <td style="padding:18px 24px; text-align:center;">${headerBrand}</td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 6px 24px rgba(0,0,0,0.06);">
              <tr>
                <td style="padding:24px 24px 8px 24px; border-bottom:1px solid ${c.grayMedium};">
                  <h1 style="margin:0; font-size:22px; line-height:1.3; color:${c.textPrimary};">${safeTitle}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px 24px 24px; color:${c.textPrimary};">
                  ${contentBlock}
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px; margin:16px auto 0;">
              <tr>
                <td style="padding:8px 24px 24px 24px; text-align:center; color:${c.textSecondary}; font-size:12px;">
                  ${escapeHtml(footer)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function templateToText({ greeting = '', bodyText = '', bulletPoints = [], ctaUrl = '', ctaLabel = '' } = {}) {
  const bullets = Array.isArray(bulletPoints) ? bulletPoints : [];
  const lines = [];
  if (greeting) lines.push(greeting);
  if (bodyText) lines.push(bodyText);
  if (bullets.length) lines.push(...bullets.map((b) => `• ${b}`));
  if (ctaUrl) lines.push(`${ctaLabel || 'Ouvrir'}: ${ctaUrl}`);
  return lines.join('\n\n');
}

export async function POST(request) {
  try {
    const { to, subject, html, text, from, fromName, template, preview } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Champs requis: to, subject' }, { status: 400 });
    }

    const { transporter, error } = getTransporter();
    if (!transporter) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const defaultFrom = process.env.EMAIL_FROM;
    const defaultFromName = process.env.EMAIL_FROM_NAME || 'MaterniBénin';

    const mailFrom = from || defaultFrom;
    const mailFromName = fromName || defaultFromName;

    if (!mailFrom) {
      return NextResponse.json({ error: 'EMAIL_FROM non défini. Ajoutez EMAIL_FROM ou fournissez "from" dans la requête.' }, { status: 500 });
    }

    // Build final HTML and TEXT
    let finalHtml = html || '';
    let finalText = text || '';

    if (!finalHtml) {
      if (template && typeof template === 'object') {
        finalHtml = generateEmailTemplate({ subject, preview, ...template });
        if (!finalText) finalText = templateToText(template);
      } else if (text) {
        finalHtml = generateEmailTemplate({ subject, preview, bodyText: text });
      } else {
        // Minimal fallback
        finalHtml = generateEmailTemplate({ subject, preview, bodyText: '' });
        if (!finalText) finalText = subject;
      }
    }

    await transporter.sendMail({
      from: mailFromName ? `${mailFromName} <${mailFrom}>` : mailFrom,
      to,
      subject,
      text: finalText || undefined,
      html: finalHtml || undefined,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Email send error:', err);
    const message = err?.message || 'Erreur lors de l\'envoi du mail';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
