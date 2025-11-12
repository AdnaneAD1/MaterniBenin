import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

/**
 * Service de gestion des notifications in-app
 */
class NotificationService {
  
  /**
   * Créer une notification
   * @param {Object} notificationData - Données de la notification
   * @returns {Promise<Object>} - Résultat de la création
   */
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        read: false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      
      return {
        success: true,
        notificationId: docRef.id,
        notification
      };
    } catch (error) {
      console.error('Erreur création notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer une notification pour une CPN à venir
   * @param {Object} cpnData - Données de la CPN
   * @param {number} daysUntil - Jours avant la CPN
   * @returns {Promise<Object>}
   */
  async createCpnReminderNotification(cpnData, daysUntil) {
    const { patient, rdv, cpnLabel, userId } = cpnData;
    
    let message = '';
    let priority = 'normal';
    
    if (daysUntil === 0) {
      message = `CPN aujourd'hui : ${patient.prenom} ${patient.nom} - ${cpnLabel || 'Consultation'}`;
      priority = 'high';
    } else if (daysUntil === 1) {
      message = `CPN demain : ${patient.prenom} ${patient.nom} - ${cpnLabel || 'Consultation'}`;
      priority = 'high';
    } else if (daysUntil === 3) {
      message = `CPN dans 3 jours : ${patient.prenom} ${patient.nom} - ${cpnLabel || 'Consultation'}`;
      priority = 'normal';
    } else if (daysUntil < 0) {
      message = `CPN en retard : ${patient.prenom} ${patient.nom} - ${cpnLabel || 'Consultation'}`;
      priority = 'urgent';
    }

    return this.createNotification({
      type: 'cpn_reminder',
      title: 'Rappel CPN',
      message,
      priority,
      userId, // Sage-femme responsable
      patientId: patient.patientId,
      patientName: `${patient.prenom} ${patient.nom}`,
      rdv: rdv,
      daysUntil,
      metadata: {
        cpnLabel,
        grossesseId: cpnData.grossesseId
      }
    });
  }

  /**
   * Créer une notification pour CPN en retard
   * @param {Object} cpnData - Données de la CPN
   * @returns {Promise<Object>}
   */
  async createLateCpnNotification(cpnData) {
    const { patient, rdv, cpnLabel, userId } = cpnData;
    // rdv est déjà un objet Date
    const rdvDate = rdv instanceof Date ? rdv : (rdv.toDate ? rdv.toDate() : new Date(rdv));
    const daysLate = Math.abs(Math.floor((new Date() - rdvDate) / (1000 * 60 * 60 * 24)));

    return this.createNotification({
      type: 'cpn_late',
      title: 'CPN en retard',
      message: `CPN en retard de ${daysLate} jour(s) : ${patient.prenom} ${patient.nom} - ${cpnLabel || 'Consultation'}`,
      priority: 'urgent',
      userId,
      patientId: patient.patientId,
      patientName: `${patient.prenom} ${patient.nom}`,
      rdv: rdv,
      daysLate,
      metadata: {
        cpnLabel,
        grossesseId: cpnData.grossesseId
      }
    });
  }

  /**
   * Récupérer les notifications d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {number} limitCount - Nombre max de notifications
   * @returns {Promise<Object>}
   */
  async getUserNotifications(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        notifications
      };
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return {
        success: false,
        error: error.message,
        notifications: []
      };
    }
  }

  /**
   * Récupérer les notifications non lues
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>}
   */
  async getUnreadNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        notifications,
        count: notifications.length
      };
    } catch (error) {
      console.error('Erreur récupération notifications non lues:', error);
      return {
        success: false,
        error: error.message,
        notifications: [],
        count: 0
      };
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {string} notificationId - ID de la notification
   * @returns {Promise<Object>}
   */
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>}
   */
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(docSnap =>
        updateDoc(doc(db, 'notifications', docSnap.id), {
          read: true,
          readAt: Timestamp.now()
        })
      );

      await Promise.all(updates);

      return {
        success: true,
        count: updates.length
      };
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer le nombre de notifications non lues
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    try {
      const result = await this.getUnreadNotifications(userId);
      return result.count;
    } catch (error) {
      console.error('Erreur comptage notifications:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
