import { NextResponse } from 'next/server';
import notificationService from '@/services/notificationService';

/**
 * POST /api/notifications/mark-all-read
 * Marquer toutes les notifications comme lues
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    const result = await notificationService.markAllAsRead(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} notification(s) marquée(s) comme lue(s)`
    });
  } catch (error) {
    console.error('Erreur marquage toutes notifications:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
