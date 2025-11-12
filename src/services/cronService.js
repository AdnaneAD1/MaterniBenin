import cron from 'node-cron';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import notificationService from './notificationService';
import smsService from './smsService';
import emailService from './emailService';

/**
 * Service de gestion des tâches planifiées (Cron Jobs)
 */
class CronService {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Récupérer toutes les CPN à venir et en retard
   */
  async getUpcomingAndLateCpns() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Récupérer toutes les consultations avec RDV
      const consultationsQuery = query(
        collection(db, 'consultations'),
        where('type', '==', 'CPN'),
        where('rdv', '!=', null)
      );

      const consultationsSnapshot = await getDocs(consultationsQuery);
      const cpnList = [];

      for (const consultationDoc of consultationsSnapshot.docs) {
        const consultation = consultationDoc.data();
        const rdv = consultation.rdv.toDate();
        
        // Calculer les jours jusqu'au RDV
        const diffTime = rdv.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Récupérer les infos de la patiente via la grossesse
        try {
          // Trouver la CPN correspondante
          const cpnQuery = query(
            collection(db, 'cpns'),
            where('consultationId', '==', consultationDoc.id)
          );
          const cpnSnapshot = await getDocs(cpnQuery);
          
          if (cpnSnapshot.empty) continue;
          
          const cpnDoc = cpnSnapshot.docs[0];
          const cpnData = cpnDoc.data();
          const grossesseId = cpnData.grossesseId;

          // Récupérer la grossesse
          const grossesseDoc = await getDocs(
            query(collection(db, 'grossesses'), where('__name__', '==', grossesseId))
          );
          
          if (grossesseDoc.empty) continue;
          
          const grossesse = grossesseDoc.docs[0].data();
          const dossierId = grossesse.dossierId;

          // Récupérer le dossier
          const dossierDoc = await getDocs(
            query(collection(db, 'dossiers'), where('__name__', '==', dossierId))
          );
          
          if (dossierDoc.empty) continue;
          
          const dossier = dossierDoc.docs[0].data();
          const patientId = dossier.patientId;

          // Récupérer la patiente
          const patientDoc = await getDocs(
            query(collection(db, 'patientes'), where('__name__', '==', patientId))
          );
          
          if (patientDoc.empty) continue;
          
          const patient = patientDoc.docs[0].data();

          cpnList.push({
            id: consultationDoc.id,
            cpnId: cpnDoc.id,
            cpnLabel: cpnData.cpn,
            rdv: consultation.rdv,
            diffDays,
            userId: consultation.userId,
            grossesseId,
            patient: {
              patientId,
              nom: patient.nom,
              prenom: patient.prenom,
              telephone: patient.telephone,
              email: patient.email
            }
          });
        } catch (error) {
          console.error('Erreur récupération données CPN:', error);
        }
      }

      return cpnList;
    } catch (error) {
      console.error('Erreur récupération CPN:', error);
      return [];
    }
  }

  /**
   * Envoyer les rappels pour une CPN
   */
  async sendReminders(cpnData, daysUntil) {
    const results = {
      notification: null,
      sms: null,
      email: null
    };

    try {
      // 1. Notification in-app (toujours)
      results.notification = await notificationService.createCpnReminderNotification(
        cpnData,
        daysUntil
      );

      // 2. SMS (si configuré et numéro disponible)
      if (smsService.isAvailable() && cpnData.patient.telephone) {
        results.sms = await smsService.sendCpnReminder(cpnData, daysUntil);
      }

      // 3. Email (si configuré et email disponible)
      if (emailService.isAvailable() && cpnData.patient.email) {
        results.email = await emailService.sendCpnReminder(cpnData, daysUntil);
      }

      console.log(`✅ Rappels envoyés pour ${cpnData.patient.prenom} ${cpnData.patient.nom} (J${daysUntil > 0 ? '+' : ''}${daysUntil})`);
    } catch (error) {
      console.error('❌ Erreur envoi rappels:', error);
    }

    return results;
  }

  /**
   * Traiter les rappels de CPN
   */
  async processCpnReminders() {
    console.log('🔄 Traitement des rappels CPN...');
    
    try {
      const cpnList = await this.getUpcomingAndLateCpns();
      console.log(`📋 ${cpnList.length} CPN trouvées`);

      let sentCount = 0;

      for (const cpn of cpnList) {
        const { diffDays } = cpn;

        // Envoyer rappel si J-3, J-1, J-0 ou en retard
        if (diffDays === 3 || diffDays === 1 || diffDays === 0 || diffDays < 0) {
          await this.sendReminders(cpn, diffDays);
          sentCount++;
        }
      }

      console.log(`✅ ${sentCount} rappels envoyés`);
    } catch (error) {
      console.error('❌ Erreur traitement rappels:', error);
    }
  }

  /**
   * Envoyer le récapitulatif journalier aux sages-femmes
   */
  async sendDailySummary() {
    console.log('📊 Envoi récapitulatif journalier...');
    
    try {
      const cpnList = await this.getUpcomingAndLateCpns();
      
      const stats = {
        cpnToday: cpnList.filter(c => c.diffDays === 0).length,
        cpnLate: cpnList.filter(c => c.diffDays < 0).length,
        cpnUpcoming: cpnList.filter(c => c.diffDays > 0 && c.diffDays <= 7).length
      };

      // Récupérer tous les utilisateurs (sages-femmes)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();
        
        // Envoyer SMS si numéro disponible
        if (smsService.isAvailable() && user.phoneNumber) {
          await smsService.sendDailySummary(user.phoneNumber, stats);
        }
      }

      console.log('✅ Récapitulatifs journaliers envoyés');
    } catch (error) {
      console.error('❌ Erreur envoi récapitulatifs:', error);
    }
  }

  /**
   * Envoyer le récapitulatif hebdomadaire aux sages-femmes
   */
  async sendWeeklySummary() {
    console.log('📊 Envoi récapitulatif hebdomadaire...');
    
    try {
      // Calculer les stats de la semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // CPN effectuées cette semaine
      const cpnCompletedQuery = query(
        collection(db, 'cpns'),
        where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
      );
      const cpnCompletedSnapshot = await getDocs(cpnCompletedQuery);

      // Nouvelles patientes cette semaine
      const newPatientsQuery = query(
        collection(db, 'patientes'),
        where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
      );
      const newPatientsSnapshot = await getDocs(newPatientsQuery);

      // Accouchements cette semaine
      const accouchementsQuery = query(
        collection(db, 'accouchements'),
        where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
      );
      const accouchementsSnapshot = await getDocs(accouchementsQuery);

      // CPN à venir et en retard
      const cpnList = await this.getUpcomingAndLateCpns();

      const stats = {
        cpnCompleted: cpnCompletedSnapshot.size,
        cpnUpcoming: cpnList.filter(c => c.diffDays > 0 && c.diffDays <= 7).length,
        cpnLate: cpnList.filter(c => c.diffDays < 0).length,
        newPatients: newPatientsSnapshot.size,
        accouchements: accouchementsSnapshot.size
      };

      // Envoyer aux sages-femmes
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();
        
        if (emailService.isAvailable() && user.email) {
          await emailService.sendWeeklySummary(user.email, stats);
        }
      }

      console.log('✅ Récapitulatifs hebdomadaires envoyés');
    } catch (error) {
      console.error('❌ Erreur envoi récapitulatifs hebdomadaires:', error);
    }
  }

  /**
   * Démarrer tous les cron jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron jobs déjà démarrés');
      return;
    }

    console.log('🚀 Démarrage des cron jobs...');

    // Job 1: Rappels CPN - Tous les jours à 8h00
    const reminderJob = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ Cron: Rappels CPN (8h00)');
      await this.processCpnReminders();
    }, {
      timezone: 'Africa/Porto-Novo' // Timezone du Bénin
    });

    // Job 2: Récapitulatif journalier - Tous les jours à 18h00
    const dailySummaryJob = cron.schedule('0 18 * * *', async () => {
      console.log('⏰ Cron: Récapitulatif journalier (18h00)');
      await this.sendDailySummary();
    }, {
      timezone: 'Africa/Porto-Novo'
    });

    // Job 3: Récapitulatif hebdomadaire - Tous les lundis à 9h00
    const weeklySummaryJob = cron.schedule('0 9 * * 1', async () => {
      console.log('⏰ Cron: Récapitulatif hebdomadaire (Lundi 9h00)');
      await this.sendWeeklySummary();
    }, {
      timezone: 'Africa/Porto-Novo'
    });

    this.jobs = [reminderJob, dailySummaryJob, weeklySummaryJob];
    this.isRunning = true;

    console.log('✅ Cron jobs démarrés:');
    console.log('  - Rappels CPN: Tous les jours à 8h00');
    console.log('  - Récapitulatif journalier: Tous les jours à 18h00');
    console.log('  - Récapitulatif hebdomadaire: Tous les lundis à 9h00');
  }

  /**
   * Arrêter tous les cron jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Cron jobs déjà arrêtés');
      return;
    }

    console.log('🛑 Arrêt des cron jobs...');
    
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;

    console.log('✅ Cron jobs arrêtés');
  }

  /**
   * Exécuter manuellement les rappels (pour test)
   */
  async runRemindersNow() {
    console.log('🔧 Exécution manuelle des rappels...');
    await this.processCpnReminders();
  }

  /**
   * Exécuter manuellement le récapitulatif journalier (pour test)
   */
  async runDailySummaryNow() {
    console.log('🔧 Exécution manuelle du récapitulatif journalier...');
    await this.sendDailySummary();
  }

  /**
   * Exécuter manuellement le récapitulatif hebdomadaire (pour test)
   */
  async runWeeklySummaryNow() {
    console.log('🔧 Exécution manuelle du récapitulatif hebdomadaire...');
    await this.sendWeeklySummary();
  }
}

// Créer une instance unique
const cronService = new CronService();

export default cronService;
