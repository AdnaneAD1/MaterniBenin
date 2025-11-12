import { NextResponse } from 'next/server';
import notificationService from '@/services/notificationService';

/**
 * PATCH /api/notifications/[id]
 * Marquer une notification comme lue
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    const result = await notificationService.markAsRead(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
