import cron from 'node-cron';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
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
   * Récupérer toutes les CPN à venir et en retard (uniquement pour grossesses en cours)
   */
  async getUpcomingAndLateCpns() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('🔍 Récupération des CPN pour grossesses en cours...');
      
      // 1. Récupérer UNIQUEMENT les grossesses en cours
      const grossessesQuery = query(
        collection(db, 'grossesses'),
        where('statut', '==', 'En cours')  // ✅ Filtrer par statut
      );
      
      const grossessesSnapshot = await getDocs(grossessesQuery);
      console.log(`📋 ${grossessesSnapshot.size} grossesses en cours trouvées`);
      
      const cpnList = [];

      // 2. Pour chaque grossesse en cours
      for (const grossesseDoc of grossessesSnapshot.docs) {
        const grossesse = grossesseDoc.data();
        const grossesseId = grossesseDoc.id;
        
        try {
          // 3. Récupérer les CPN de cette grossesse
          const cpnsQuery = query(
            collection(db, 'cpns'),
            where('grossesseId', '==', grossesseId)
          );
          const cpnsSnapshot = await getDocs(cpnsQuery);
          
          if (cpnsSnapshot.empty) continue;
          
          // 4. Récupérer toutes les consultations avec RDV pour cette grossesse
          const consultationsWithRdv = [];
          
          for (const cpnDoc of cpnsSnapshot.docs) {
            const cpnData = cpnDoc.data();
            const consultationId = cpnData.consultationId;
            
            if (!consultationId) continue;
            
            // Récupérer la consultation
            const consultationQuery = query(
              collection(db, 'consultations'),
              where('__name__', '==', consultationId)
            );
            const consultationSnapshot = await getDocs(consultationQuery);
            
            if (consultationSnapshot.empty) continue;
            
            const consultation = consultationSnapshot.docs[0].data();
            
            // Vérifier que la consultation a un RDV non vide
            if (!consultation.rdv || consultation.rdv === '') continue;
            
            // Ajouter à la liste temporaire avec la date de création
            consultationsWithRdv.push({
              cpnDoc,
              cpnData,
              consultationId,
              consultation,
              createdAt: consultation.createdAt || consultation.dateConsultation
            });
          }
          
          // 5. Si aucune consultation avec RDV, passer à la grossesse suivante
          if (consultationsWithRdv.length === 0) continue;
          
          // 6. Trier par date de création (la plus récente en premier)
          consultationsWithRdv.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // Décroissant (plus récent en premier)
          });
          
          // 7. Prendre uniquement la dernière consultation (la plus récente)
          const lastConsultation = consultationsWithRdv[0];
          const { cpnDoc, cpnData, consultationId, consultation } = lastConsultation;
          
          console.log(`📌 Grossesse ${grossesseId}: Dernière consultation avec RDV = ${consultationId}`);
          
          // 8. Convertir la date RDV
          let rdv;
          if (consultation.rdv.toDate) {
            rdv = consultation.rdv.toDate();
          } else if (typeof consultation.rdv === 'string') {
            rdv = new Date(consultation.rdv);
          } else {
            console.log('⚠️ Format RDV non supporté pour consultation', consultationId);
            continue;
          }
          
          // Vérifier que la date est valide
          if (isNaN(rdv.getTime())) {
            console.log('⚠️ Date RDV invalide pour consultation', consultationId);
            continue;
          }
          
          // 9. Calculer les jours jusqu'au RDV
          const diffTime = rdv.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // 10. Récupérer les infos de la patiente
          const dossierId = grossesse.dossierId;
          
          // Récupérer le dossier
          const dossierQuery = query(
            collection(db, 'dossiers'),
            where('__name__', '==', dossierId)
          );
          const dossierSnapshot = await getDocs(dossierQuery);
          
          if (dossierSnapshot.empty) continue;
          
          const dossier = dossierSnapshot.docs[0].data();
          const patientId = dossier.patientId;
          
          // Récupérer la patiente
          const patientQuery = query(
            collection(db, 'patientes'),
            where('__name__', '==', patientId)
          );
          const patientSnapshot = await getDocs(patientQuery);
          
          if (patientSnapshot.empty) continue;
          
          const patient = patientSnapshot.docs[0].data();
          
          // Récupérer les infos de la personne
          const personneId = patient.personneId;
          const personneQuery = query(
            collection(db, 'personnes'),
            where('__name__', '==', personneId)
          );
          const personneSnapshot = await getDocs(personneQuery);
          
          let nom = patient.nom || 'N/A';
          let prenom = patient.prenom || 'N/A';
          let telephone = patient.telephone || '';
          let email = patient.email || '';
          
          if (!personneSnapshot.empty) {
            const personne = personneSnapshot.docs[0].data();
            nom = personne.nom || nom;
            prenom = personne.prenom || prenom;
            telephone = personne.telephone || telephone;
            email = personne.email || email;
          }

          // 11. Ajouter à la liste (une seule CPN par grossesse)
          cpnList.push({
            id: consultationId,
            cpnId: cpnDoc.id,
            cpnLabel: cpnData.cpn,
            rdv: rdv, // Utiliser l'objet Date déjà converti
            rdvOriginal: consultation.rdv, // Garder l'original pour référence
            diffDays,
            userId: consultation.userId,
            grossesseId,
            patient: {
              patientId,
              nom,
              prenom,
              telephone,
              email
            }
          });
          
          console.log(`✅ CPN ajoutée: ${prenom} ${nom} - RDV dans ${diffDays} jours`);
        } catch (error) {
          console.error(`❌ Erreur traitement grossesse ${grossesseId}:`, error);
        }
      }

      console.log(`📊 Total: ${cpnList.length} CPN avec RDV trouvées`);
      return cpnList;
    } catch (error) {
      console.error('❌ Erreur récupération CPN:', error);
      return [];
    }
  }

  /**
   * Récupérer les RDV de planification familiale à venir (uniquement futures et présentes)
   */
  async getUpcomingPlanificationRdv() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('🔍 Récupération des RDV planification familiale...');
      
      // Récupérer toutes les planifications avec RDV
      const planificationsQuery = query(
        collection(db, 'planifications')
      );
      
      const planificationsSnapshot = await getDocs(planificationsQuery);
      console.log(`📋 ${planificationsSnapshot.size} planifications trouvées`);
      
      const rdvList = [];

      for (const planifDoc of planificationsSnapshot.docs) {
        const planifData = planifDoc.data();
        const rdvProchain = planifData.rdvProchain;

        // Vérifier que le RDV existe et n'est pas vide
        if (!rdvProchain || rdvProchain === '') continue;

        try {
          // Convertir la date RDV
          let rdv;
          if (rdvProchain.toDate) {
            rdv = rdvProchain.toDate();
          } else if (typeof rdvProchain === 'string') {
            rdv = new Date(rdvProchain);
          } else {
            console.log('⚠️ Format RDV non supporté pour planification', planifDoc.id);
            continue;
          }

          // Vérifier que la date est valide
          if (isNaN(rdv.getTime())) {
            console.log('⚠️ Date RDV invalide pour planification', planifDoc.id);
            continue;
          }

          // Calculer les jours jusqu'au RDV
          const diffTime = rdv.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // ⭐ UNIQUEMENT les dates futures et présentes (diffDays >= 0)
          if (diffDays < 0) {
            console.log(`⏭️ RDV passé (${diffDays} jours), skip`);
            continue;
          }

          // Récupérer les informations de la patiente
          const dossierId = planifData.dossierId;
          if (!dossierId) continue;

          const dossierDoc = await getDocs(query(
            collection(db, 'dossiers'),
            where('__name__', '==', dossierId)
          ));
          
          if (dossierDoc.empty) continue;
          
          const dossierData = dossierDoc.docs[0].data();
          const patientId = dossierData.patientId;

          const patientDoc = await getDocs(query(
            collection(db, 'patientes'),
            where('__name__', '==', patientId)
          ));
          
          if (patientDoc.empty) continue;
          
          const patientData = patientDoc.docs[0].data();
          const personneId = patientData.personneId;

          const personneDoc = await getDocs(query(
            collection(db, 'personnes'),
            where('__name__', '==', personneId)
          ));
          
          if (personneDoc.empty) continue;
          
          const personne = personneDoc.docs[0].data();

          // Ajouter à la liste
          rdvList.push({
            id: planifDoc.id,
            type: 'planification',
            methode: planifData.methode || 'Planification familiale',
            rdv: rdv,
            rdvOriginal: rdvProchain,
            diffDays,
            userId: planifData.userId,
            patient: {
              patientId,
              nom: personne.nom || '',
              prenom: personne.prenom || '',
              telephone: personne.telephone || '',
              email: personne.email || ''
            }
          });

          console.log(`✅ RDV ajouté: ${personne.prenom} ${personne.nom} - RDV dans ${diffDays} jours (${planifData.methode})`);
        } catch (error) {
          console.error(`❌ Erreur traitement planification ${planifDoc.id}:`, error);
        }
      }

      console.log(`📊 Total: ${rdvList.length} RDV planification à venir`);
      return rdvList;
    } catch (error) {
      console.error('❌ Erreur récupération RDV planification:', error);
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
   * Traiter les rappels de CPN et Planification Familiale
   */
  async processCpnReminders() {
    console.log('🔄 Traitement des rappels CPN et Planification Familiale...');
    
    try {
      // 1. Récupérer les CPN
      const cpnList = await this.getUpcomingAndLateCpns();
      console.log(`📋 ${cpnList.length} CPN trouvées`);

      // 2. Récupérer les RDV de planification familiale
      const planifList = await this.getUpcomingPlanificationRdv();
      console.log(`📋 ${planifList.length} RDV planification trouvés`);

      let sentCount = 0;

      // 3. Traiter les rappels CPN
      for (const cpn of cpnList) {
        const { diffDays } = cpn;

        // Envoyer rappel si J-3, J-1, J-0 ou en retard
        if (diffDays === 3 || diffDays === 1 || diffDays === 0 || diffDays < 0) {
          await this.sendReminders(cpn, diffDays);
          sentCount++;
        }
      }

      // 4. Traiter les rappels Planification Familiale (uniquement J-3, J-1, J-0)
      for (const planif of planifList) {
        const { diffDays } = planif;

        // ⭐ Uniquement J-3, J-1, J-0 (pas de retard car on filtre déjà les dates passées)
        if (diffDays === 3 || diffDays === 1 || diffDays === 0) {
          await this.sendReminders(planif, diffDays);
          sentCount++;
        }
      }

      console.log(`✅ ${sentCount} rappels envoyés (CPN + Planification)`);
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
