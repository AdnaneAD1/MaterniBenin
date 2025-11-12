import { NextResponse } from 'next/server';
import notificationService from '@/services/notificationService';

/**
 * GET /api/notifications
 * Récupérer les notifications d'un utilisateur
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    let result;
    if (unreadOnly) {
      result = await notificationService.getUnreadNotifications(userId);
    } else {
      result = await notificationService.getUserNotifications(userId, limit);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: result.notifications,
      count: result.count || result.notifications.length
    });
  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Créer une notification
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await notificationService.createNotification(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notificationId: result.notificationId,
      notification: result.notification
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
