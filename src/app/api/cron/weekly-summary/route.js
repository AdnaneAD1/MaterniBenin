import { NextResponse } from 'next/server';
import cronService from '@/services/cronService';

/**
 * GET /api/cron/weekly-summary
 * Exécuter le récapitulatif hebdomadaire
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

    await cronService.runWeeklySummaryNow();

    return NextResponse.json({
      success: true,
      message: 'Récapitulatif hebdomadaire envoyé',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur récapitulatif hebdomadaire:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
