import { NextResponse } from 'next/server';
import cronService from '@/services/cronService';

/**
 * POST /api/cron/reminders
 * Exécuter manuellement les rappels CPN
 */
export async function POST(request) {
  try {
    // Vérifier l'authentification (optionnel)
    const { authorization } = await request.json();
    
    // Vous pouvez ajouter une clé secrète pour sécuriser l'endpoint
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authorization !== cronSecret) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await cronService.runRemindersNow();

    return NextResponse.json({
      success: true,
      message: 'Rappels CPN exécutés avec succès'
    });
  } catch (error) {
    console.error('Erreur exécution rappels:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/reminders
 * Exécuter les rappels via GET (pour services externes comme cron-job.org)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await cronService.runRemindersNow();

    return NextResponse.json({
      success: true,
      message: 'Rappels CPN exécutés avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur exécution rappels:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
