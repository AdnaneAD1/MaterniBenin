import cronService from '@/services/cronService';

/**
 * Initialiser les cron jobs au démarrage de l'application
 * À appeler dans le fichier layout.js ou dans un middleware
 */
let cronInitialized = false;

export function initializeCronJobs() {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    return;
  }

  // Éviter la double initialisation
  if (cronInitialized) {
    return;
  }

  try {
    console.log('🚀 Initialisation des cron jobs...');
    cronService.start();
    cronInitialized = true;
    console.log('✅ Cron jobs initialisés avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation cron jobs:', error);
  }
}

export default initializeCronJobs;
