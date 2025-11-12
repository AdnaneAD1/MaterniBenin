import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';

/**
 * Hook personnalisé pour gérer les notifications
 */
export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Charger les notifications
   */
  const loadNotifications = useCallback(async (unreadOnly = false) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: currentUser.uid,
        unreadOnly: unreadOnly.toString(),
        limit: '50'
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur chargement notifications');
      }

      setNotifications(data.notifications);
      if (unreadOnly) {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Charger le nombre de notifications non lues
   */
  const loadUnreadCount = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const params = new URLSearchParams({
        userId: currentUser.uid,
        unreadOnly: 'true'
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Erreur comptage notifications:', err);
    }
  }, [currentUser]);

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur marquage notification');
      }

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Décrémenter le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));

      return { success: true };
    } catch (err) {
      console.error('Erreur marquage notification:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser.uid })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur marquage notifications');
      }

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      return { success: true, count: data.count };
    } catch (err) {
      console.error('Erreur marquage toutes notifications:', err);
      return { success: false, error: err.message };
    }
  }, [currentUser]);

  /**
   * Rafraîchir les notifications
   */
  const refresh = useCallback(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Charger les notifications au montage et toutes les 30 secondes
  useEffect(() => {
    if (currentUser?.uid) {
      loadNotifications();
      loadUnreadCount();

      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // 30 secondes

      return () => clearInterval(interval);
    }
  }, [currentUser, loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh
  };
}

export default useNotifications;
