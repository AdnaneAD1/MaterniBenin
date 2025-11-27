export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminAuth } from '@/firebase/admin';

function generateStrongPassword(length = 14) {
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.?';

  // Ensure at least one of each
  const required = [
    lowers[Math.floor(Math.random() * lowers.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const all = lowers + uppers + numbers + symbols;
  const remainingLen = Math.max(4, length) - required.length;

  const bytes = crypto.randomBytes(remainingLen);
  const rest = Array.from(bytes).map((b) => all[b % all.length]);
  const combined = [...required, ...rest];

  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

export async function POST(request) {
  try {
    // Guard: admin initialized (auth instance available)
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin non initialisé. Vérifiez les variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, displayName, centreId, role = 'sage-femme' } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'email requis' }, { status: 400 });
    }

    const password = generateStrongPassword(14);

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false,
    });

    // Attempt to send welcome email with generated password
    let emailSent = false;
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host');
      const baseUrl = `${protocol}://${host}`;

      const greetingName = userRecord.displayName || displayName || '';

      const emailRes = await fetch(`${baseUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userRecord.email,
          subject: 'Votre compte MaterniBénin',
          preview: 'Votre mot de passe temporaire a été généré.',
          template: {
            title: 'Bienvenue sur MaterniBénin',
            greeting: greetingName ? `Bonjour ${greetingName},` : 'Bonjour,',
            bodyText: "Votre compte a été créé avec succès. Voici votre mot de passe temporaire. Veuillez le changer lors de votre première connexion.",
            bulletPoints: [
              `Email: ${userRecord.email}`,
              `Mot de passe temporaire: ${password}`,
            ],
            ctaUrl: `${baseUrl}/connexion`,
            ctaLabel: 'Se connecter',
            footer: "Si vous n'êtes pas à l'origine de cette action, ignorez cet email ou contactez le support.",
          },
        }),
      });

      emailSent = emailRes.ok;
    } catch (e) {
      // Log but do not block user creation response
      console.error('Failed to send welcome email:', e);
    }

    return NextResponse.json(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || displayName || null,
        centreId: centreId || null,
        role: role,
        generatedPassword: password, // Montrez-le uniquement côté admin et stockez-le de manière sécurisée
        emailSent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create user error:', err);
    const code = err?.code || 'unknown';
    const message = err?.message || 'Erreur inconnue';
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}
