import nodemailer from 'nodemailer';

/**
 * Service d'envoi d'emails avec Nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialiser le transporteur Nodemailer
   */
  initialize() {
    if (this.initialized) return;

    const emailUser = process.env.SMTP_USER;
    const emailPass = process.env.SMTP_PASS;
    const emailHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const emailPort = process.env.SMTP_PORT || 587;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ Configuration Email manquante. Emails désactivés.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailPort === '465', // true pour 465, false pour autres ports
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      this.fromEmail = emailUser;
      this.fromName = process.env.EMAIL_FROM_NAME || 'MaterniBénin';
      this.initialized = true;
      
      console.log('✅ Service Email Nodemailer initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation Nodemailer:', error);
    }
  }

  /**
   * Vérifier si le service est disponible
   */
  isAvailable() {
    return this.initialized && this.transporter !== null;
  }

  /**
   * Envoyer un email
   * @param {Object} options - Options de l'email
   * @returns {Promise<Object>}
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.isAvailable()) {
      console.log('📧 Email non envoyé (service désactivé):', { to, subject });
      return {
        success: false,
        error: 'Service Email non configuré',
        mock: true
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        text,
        html: html || text
      });

      console.log('✅ Email envoyé:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        to
      };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer le template HTML pour un rappel de CPN
   */
  createCpnReminderTemplate(cpnData, daysUntil) {
    const { patient, rdv, cpnLabel } = cpnData;
    const rdvDate = rdv.toDate();
    const dateStr = rdvDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = rdvDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let title = '';
    let message = '';
    let color = '#3B82F6'; // blue

    if (daysUntil === 0) {
      title = 'Rappel : Consultation aujourd\'hui';
      message = `Votre ${cpnLabel || 'consultation prénatale'} est prévue aujourd'hui à ${timeStr}.`;
      color = '#EF4444'; // red
    } else if (daysUntil === 1) {
      title = 'Rappel : Consultation demain';
      message = `Votre ${cpnLabel || 'consultation prénatale'} est prévue demain, ${dateStr} à ${timeStr}.`;
      color = '#F59E0B'; // orange
    } else if (daysUntil === 3) {
      title = 'Rappel : Consultation dans 3 jours';
      message = `Votre ${cpnLabel || 'consultation prénatale'} est prévue le ${dateStr} à ${timeStr}.`;
      color = '#3B82F6'; // blue
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid ${color}; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: ${color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MaterniBénin</h1>
            <h2>${title}</h2>
          </div>
          <div class="content">
            <p>Bonjour Madame ${patient.nom},</p>
            <p>${message}</p>
            
            <div class="info-box">
              <h3>📋 Détails du rendez-vous</h3>
              <p><strong>Date :</strong> ${dateStr}</p>
              <p><strong>Heure :</strong> ${timeStr}</p>
              <p><strong>Type :</strong> ${cpnLabel || 'Consultation prénatale'}</p>
              <p><strong>Patiente :</strong> ${patient.prenom} ${patient.nom}</p>
            </div>

            <p><strong>⚠️ Important :</strong></p>
            <ul>
              <li>Apportez votre carnet de santé</li>
              <li>Venez à jeun si des analyses sont prévues</li>
              <li>Prévoyez d'arriver 10 minutes avant l'heure</li>
            </ul>

            <p>En cas d'empêchement, merci de nous contacter au plus tôt.</p>
          </div>
          <div class="footer">
            <p>Centre de santé MaterniBénin</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envoyer un rappel de CPN par email
   * @param {Object} cpnData - Données de la CPN
   * @param {number} daysUntil - Jours avant la CPN
   * @returns {Promise<Object>}
   */
  async sendCpnReminder(cpnData, daysUntil) {
    const { patient, rdv, cpnLabel } = cpnData;
    
    if (!patient.email) {
      return {
        success: false,
        error: 'Email manquant'
      };
    }

    const rdvDate = rdv.toDate();
    const dateStr = rdvDate.toLocaleDateString('fr-FR');
    const timeStr = rdvDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let subject = '';
    
    if (daysUntil === 0) {
      subject = `Rappel : ${cpnLabel || 'CPN'} aujourd'hui à ${timeStr}`;
    } else if (daysUntil === 1) {
      subject = `Rappel : ${cpnLabel || 'CPN'} demain à ${timeStr}`;
    } else if (daysUntil === 3) {
      subject = `Rappel : ${cpnLabel || 'CPN'} le ${dateStr}`;
    }

    const html = this.createCpnReminderTemplate(cpnData, daysUntil);
    const text = `Bonjour Mme ${patient.nom},\n\nVotre ${cpnLabel || 'consultation prénatale'} est prévue le ${dateStr} à ${timeStr}.\n\nCentre de santé MaterniBénin`;

    return this.sendEmail({
      to: patient.email,
      subject,
      text,
      html
    });
  }

  /**
   * Envoyer un récapitulatif hebdomadaire à la sage-femme
   * @param {string} email - Email de la sage-femme
   * @param {Object} stats - Statistiques de la semaine
   * @returns {Promise<Object>}
   */
  async sendWeeklySummary(email, stats) {
    const { 
      cpnCompleted, 
      cpnUpcoming, 
      cpnLate, 
      newPatients, 
      accouchements 
    } = stats;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 30px; text-align: center; }
          .stats { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
          .stat-box { flex: 1; min-width: 150px; background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #3B82F6; }
          .stat-label { color: #6b7280; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Récapitulatif Hebdomadaire</h1>
            <p>Semaine du ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div style="padding: 20px;">
            <h2>Statistiques de la semaine</h2>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-number">${cpnCompleted}</div>
                <div class="stat-label">CPN effectuées</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${cpnUpcoming}</div>
                <div class="stat-label">CPN à venir</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${cpnLate}</div>
                <div class="stat-label">CPN en retard</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${newPatients}</div>
                <div class="stat-label">Nouvelles patientes</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${accouchements}</div>
                <div class="stat-label">Accouchements</div>
              </div>
            </div>
            <p style="margin-top: 30px; color: #6b7280;">
              Ce récapitulatif est envoyé automatiquement chaque semaine.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '📊 Récapitulatif hebdomadaire - MaterniBénin',
      text: `Récapitulatif de la semaine:\nCPN effectuées: ${cpnCompleted}\nCPN à venir: ${cpnUpcoming}\nCPN en retard: ${cpnLate}\nNouvelles patientes: ${newPatients}\nAccouchements: ${accouchements}`,
      html
    });
  }
}

// Créer une instance unique
const emailService = new EmailService();

// Initialiser au démarrage (côté serveur uniquement)
if (typeof window === 'undefined') {
  emailService.initialize();
}

export default emailService;
