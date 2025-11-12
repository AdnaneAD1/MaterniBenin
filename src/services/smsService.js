import twilio from 'twilio';

/**
 * Service d'envoi de SMS via Twilio
 */
class SMSService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialiser le client Twilio
   */
  initialize() {
    if (this.initialized) return;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('⚠️ Configuration Twilio manquante. SMS désactivés.');
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      this.phoneNumber = phoneNumber;
      this.initialized = true;
      console.log('✅ Service SMS Twilio initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation Twilio:', error);
    }
  }

  /**
   * Vérifier si le service est disponible
   */
  isAvailable() {
    return this.initialized && this.client !== null;
  }

  /**
   * Formater le numéro de téléphone au format international Twilio
   * Formats acceptés en entrée :
   * - 0160807271 (format local avec 0)
   * - 60807271 (format local sans 0)
   * - +22960807271 (déjà au format international)
   * 
   * @param {string} phone - Numéro de téléphone
   * @returns {string} - Numéro formaté au format +229XXXXXXXX
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Nettoyer le numéro (enlever espaces, tirets, parenthèses, etc.)
    let cleaned = phone.toString().replace(/\D/g, '');
    
    // Cas 1: Numéro commence par 229 (indicatif Bénin déjà présent)
    if (cleaned.startsWith('229')) {
      // Vérifier que le numéro après 229 a 8 chiffres
      const localPart = cleaned.substring(3);
      if (localPart.length === 8) {
        return cleaned;
      }
    }
    
    // Cas 2: Numéro commence par 0 (format local béninois)
    if (cleaned.startsWith('0')) {
      // Format béninois : 01XXXXXXXX (10 chiffres) ou 0XXXXXXXX (9 chiffres)
      if (cleaned.length === 10 && cleaned.startsWith('01')) {
        // Enlever les 2 premiers chiffres (01) pour obtenir 8 chiffres
        return '229' + cleaned.substring(2);
      } else if (cleaned.length === 9) {
        // Enlever le 0 initial pour obtenir 8 chiffres
        return '229' + cleaned.substring(1);
      }
    }
    
    // Cas 3: Numéro sans 0 (8 chiffres uniquement)
    if (cleaned.length === 8) {
      return '229' + cleaned;
    }
    
    // Si aucun format reconnu, logger l'erreur et retourner null
    console.warn(`⚠️ Format de numéro non reconnu: ${phone} (nettoyé: ${cleaned})`);
    return null;
  }

  /**
   * Envoyer un SMS
   * @param {string} to - Numéro destinataire
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object>}
   */
  async sendSMS(to, message) {
    if (!this.isAvailable()) {
      console.log('📱 SMS non envoyé (service désactivé):', { to, message });
      return {
        success: false,
        error: 'Service SMS non configuré',
        mock: true
      };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
      if (!formattedPhone) {
        throw new Error('Numéro de téléphone invalide');
      }
      
      // Vérifier que le numéro destinataire n'est pas le même que le numéro Twilio
      if (formattedPhone === this.phoneNumber) {
        console.warn(`⚠️ Tentative d'envoi SMS au même numéro que Twilio: ${formattedPhone}`);
        return {
          success: false,
          error: 'Numéro destinataire identique au numéro Twilio',
          skipped: true
        };
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedPhone
      });

      console.log('✅ SMS envoyé:', result.sid);
      
      return {
        success: true,
        messageId: result.sid,
        to: formattedPhone,
        status: result.status
      };
    } catch (error) {
      console.error('❌ Erreur envoi SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un rappel de CPN par SMS
   * @param {Object} cpnData - Données de la CPN
   * @param {number} daysUntil - Jours avant la CPN
   * @returns {Promise<Object>}
   */
  async sendCpnReminder(cpnData, daysUntil) {
    const { patient, rdv, cpnLabel } = cpnData;
    
    if (!patient.telephone) {
      return {
        success: false,
        error: 'Numéro de téléphone manquant'
      };
    }

    // rdv est déjà un objet Date
    const rdvDate = rdv instanceof Date ? rdv : (rdv.toDate ? rdv.toDate() : new Date(rdv));
    const dateStr = rdvDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = rdvDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = '';
    
    if (daysUntil === 0) {
      message = `Bonjour Mme ${patient.nom},\n\nRappel: Votre ${cpnLabel || 'consultation prénatale'} est aujourd'hui à ${timeStr}.\n\nCentre de santé MaterniBénin`;
    } else if (daysUntil === 1) {
      message = `Bonjour Mme ${patient.nom},\n\nRappel: Votre ${cpnLabel || 'consultation prénatale'} est demain ${dateStr} à ${timeStr}.\n\nCentre de santé MaterniBénin`;
    } else if (daysUntil === 3) {
      message = `Bonjour Mme ${patient.nom},\n\nVotre ${cpnLabel || 'consultation prénatale'} est prévue le ${dateStr} à ${timeStr}.\n\nCentre de santé MaterniBénin`;
    } else if (daysUntil < 0) {
      const daysLate = Math.abs(daysUntil);
      message = `Bonjour Mme ${patient.nom},\n\nVotre ${cpnLabel || 'consultation prénatale'} était prévue le ${dateStr}. Merci de nous contacter pour un nouveau rendez-vous.\n\nCentre de santé MaterniBénin`;
    }

    return this.sendSMS(patient.telephone, message);
  }

  /**
   * Envoyer un récapitulatif journalier à la sage-femme
   * @param {string} phone - Numéro de la sage-femme
   * @param {Object} stats - Statistiques du jour
   * @returns {Promise<Object>}
   */
  async sendDailySummary(phone, stats) {
    const { cpnToday, cpnLate, cpnUpcoming } = stats;
    
    const message = `📊 Récapitulatif du jour\n\n` +
      `CPN aujourd'hui: ${cpnToday}\n` +
      `CPN en retard: ${cpnLate}\n` +
      `CPN à venir (7j): ${cpnUpcoming}\n\n` +
      `MaterniBénin`;

    return this.sendSMS(phone, message);
  }
}

// Créer une instance unique
const smsService = new SMSService();

// Initialiser au démarrage (côté serveur uniquement)
if (typeof window === 'undefined') {
  smsService.initialize();
}

export default smsService;
