import { NextResponse } from 'next/server';
import cronService from '@/services/cronService';

/**
 * POST /api/cron/start
 * Démarrer les cron jobs
 */
export async function POST(request) {
  try {
    const { authorization } = await request.json();
    
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authorization !== cronSecret) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    cronService.start();

    return NextResponse.json({
      success: true,
      message: 'Cron jobs démarrés',
      jobs: [
        'Rappels CPN: Tous les jours à 8h00',
        'Récapitulatif journalier: Tous les jours à 18h00',
        'Récapitulatif hebdomadaire: Tous les lundis à 9h00'
      ]
    });
  } catch (error) {
    console.error('Erreur démarrage cron:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cron/start
 * Arrêter les cron jobs
 */
export async function DELETE(request) {
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

    cronService.stop();

    return NextResponse.json({
      success: true,
      message: 'Cron jobs arrêtés'
    });
  } catch (error) {
    console.error('Erreur arrêt cron:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
