import { NextResponse } from 'next/server';
import cronService from '@/services/cronService';

/**
 * GET /api/cron/daily-summary
 * Exécuter le récapitulatif journalier
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

    await cronService.runDailySummaryNow();

    return NextResponse.json({
      success: true,
      message: 'Récapitulatif journalier envoyé',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur récapitulatif journalier:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
