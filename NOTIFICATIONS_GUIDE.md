# 🔔 Guide complet du système de notifications MaterniBénin

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Cron Jobs](#cron-jobs)
7. [API Endpoints](#api-endpoints)
8. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Le système de notifications MaterniBénin comprend **3 phases** :

### **Phase 1 : Notifications In-App** ✅
- Notifications en temps réel dans l'application
- Badge avec compteur de notifications non lues
- Système de priorités (normal, high, urgent)
- Marquage lu/non lu

### **Phase 2 : SMS (Twilio)** ✅
- Rappels automatiques aux patientes
- Récapitulatif journalier pour les sages-femmes
- Support numéros béninois (+229)

### **Phase 3 : Email (Nodemailer)** ✅
- Emails HTML élégants
- Récapitulatif hebdomadaire
- Templates personnalisables

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CRON SERVICE                          │
│  (Tâches automatiques planifiées)                      │
│                                                         │
│  • Rappels CPN: Tous les jours à 8h00                  │
│  • Récap journalier: Tous les jours à 18h00            │
│  • Récap hebdomadaire: Tous les lundis à 9h00          │
└──────────────┬──────────────────────────────────────────┘
               │
               ├──────────────┬──────────────┬────────────┐
               ▼              ▼              ▼            ▼
       ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Notification │ │   SMS    │ │  Email   │ │   API    │
       │   Service    │ │ Service  │ │ Service  │ │  Routes  │
       │   (In-App)   │ │ (Twilio) │ │(Nodemailer)│          │
       └──────────────┘ └──────────┘ └──────────┘ └──────────┘
               │              │              │            │
               └──────────────┴──────────────┴────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │   FIREBASE    │
                      │   FIRESTORE   │
                      └───────────────┘
```

---

## 📦 Installation

### 1. Packages déjà installés

```bash
✅ node-cron
✅ twilio
✅ nodemailer
```

### 2. Fichiers créés

```
src/
├── services/
│   ├── notificationService.js   # Notifications in-app
│   ├── smsService.js             # SMS via Twilio
│   ├── emailService.js           # Emails via Nodemailer
│   └── cronService.js            # Cron jobs automatiques
├── hooks/
│   └── useNotifications.js       # Hook React pour notifications
├── app/api/
│   ├── notifications/
│   │   ├── route.js              # GET/POST notifications
│   │   ├── [id]/route.js         # PATCH notification
│   │   └── mark-all-read/route.js
│   └── cron/
│       ├── start/route.js        # Démarrer/arrêter cron
│       ├── reminders/route.js    # Rappels CPN
│       ├── daily-summary/route.js
│       └── weekly-summary/route.js
└── lib/
    └── initCron.js               # Initialisation cron
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez `.env.local` à la racine :

```env
# TWILIO (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+229XXXXXXXX

# EMAIL (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
EMAIL_FROM_NAME=MaterniBénin

# CRON
CRON_SECRET=votre_cle_secrete_aleatoire_32_caracteres
```

### 2. Initialiser les cron jobs

Dans `src/app/layout.js`, ajoutez :

```javascript
import { initializeCronJobs } from '@/lib/initCron';

// Initialiser les cron jobs au démarrage
if (typeof window === 'undefined') {
  initializeCronJobs();
}

export default function RootLayout({ children }) {
  // ... votre code existant
}
```

---

## 🚀 Utilisation

### Notifications In-App

#### Dans un composant React

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function MonComposant() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refresh 
  } = useNotifications();

  return (
    <div>
      <p>Notifications non lues : {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

#### Créer une notification manuellement

```javascript
import notificationService from '@/services/notificationService';

await notificationService.createNotification({
  type: 'custom',
  title: 'Titre',
  message: 'Message de la notification',
  priority: 'normal', // 'normal', 'high', 'urgent'
  userId: 'user_id_sage_femme'
});
```

### SMS

```javascript
import smsService from '@/services/smsService';

// Envoyer un SMS simple
await smsService.sendSMS('+229XXXXXXXX', 'Votre message');

// Rappel CPN automatique
await smsService.sendCpnReminder(cpnData, daysUntil);
```

### Email

```javascript
import emailService from '@/services/emailService';

// Email simple
await emailService.sendEmail({
  to: 'patient@example.com',
  subject: 'Sujet',
  text: 'Contenu texte',
  html: '<p>Contenu HTML</p>'
});

// Rappel CPN avec template
await emailService.sendCpnReminder(cpnData, daysUntil);
```

---

## ⏰ Cron Jobs

### Planification automatique

Les cron jobs démarrent automatiquement au lancement de l'application :

| Tâche | Fréquence | Heure | Description |
|-------|-----------|-------|-------------|
| **Rappels CPN** | Quotidien | 8h00 | Envoie rappels J-3, J-1, J-0 et retards |
| **Récap journalier** | Quotidien | 18h00 | SMS aux sages-femmes avec stats du jour |
| **Récap hebdomadaire** | Lundi | 9h00 | Email aux sages-femmes avec stats semaine |

### Exécution manuelle

#### Via API (pour tests)

```bash
# Rappels CPN
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Content-Type: application/json" \
  -d '{"authorization": "votre_cron_secret"}'

# Récapitulatif journalier
curl http://localhost:3000/api/cron/daily-summary?secret=votre_cron_secret

# Récapitulatif hebdomadaire
curl http://localhost:3000/api/cron/weekly-summary?secret=votre_cron_secret
```

#### Via code

```javascript
import cronService from '@/services/cronService';

// Exécuter maintenant
await cronService.runRemindersNow();
await cronService.runDailySummaryNow();
await cronService.runWeeklySummaryNow();

// Démarrer/arrêter les cron jobs
cronService.start();
cronService.stop();
```

### Utiliser un service externe (Production)

Pour que les cron jobs fonctionnent **sans avoir l'application ouverte**, utilisez un service externe :

#### Option 1 : cron-job.org (Gratuit)

1. Créer un compte sur [cron-job.org](https://cron-job.org)
2. Ajouter ces 3 jobs :

```
Rappels CPN:
URL: https://votre-domaine.com/api/cron/reminders?secret=VOTRE_SECRET
Fréquence: Tous les jours à 8h00

Récap journalier:
URL: https://votre-domaine.com/api/cron/daily-summary?secret=VOTRE_SECRET
Fréquence: Tous les jours à 18h00

Récap hebdomadaire:
URL: https://votre-domaine.com/api/cron/weekly-summary?secret=VOTRE_SECRET
Fréquence: Tous les lundis à 9h00
```

#### Option 2 : EasyCron (Gratuit jusqu'à 20 jobs)

Même principe que cron-job.org

#### Option 3 : Serveur dédié avec crontab

Si vous avez un serveur Linux :

```bash
# Éditer crontab
crontab -e

# Ajouter ces lignes
0 8 * * * curl https://votre-domaine.com/api/cron/reminders?secret=VOTRE_SECRET
0 18 * * * curl https://votre-domaine.com/api/cron/daily-summary?secret=VOTRE_SECRET
0 9 * * 1 curl https://votre-domaine.com/api/cron/weekly-summary?secret=VOTRE_SECRET
```

---

## 📡 API Endpoints

### Notifications

#### GET /api/notifications
Récupérer les notifications d'un utilisateur

```bash
GET /api/notifications?userId=USER_ID&unreadOnly=true&limit=50
```

#### POST /api/notifications
Créer une notification

```bash
POST /api/notifications
{
  "type": "cpn_reminder",
  "title": "Rappel CPN",
  "message": "CPN demain",
  "priority": "high",
  "userId": "USER_ID"
}
```

#### PATCH /api/notifications/[id]
Marquer comme lue

```bash
PATCH /api/notifications/NOTIFICATION_ID
```

#### POST /api/notifications/mark-all-read
Marquer toutes comme lues

```bash
POST /api/notifications/mark-all-read
{
  "userId": "USER_ID"
}
```

### Cron Jobs

#### POST /api/cron/start
Démarrer les cron jobs

```bash
POST /api/cron/start
{
  "authorization": "CRON_SECRET"
}
```

#### GET /api/cron/reminders
Exécuter les rappels

```bash
GET /api/cron/reminders?secret=CRON_SECRET
```

---

## 🔧 Dépannage

### Les notifications n'apparaissent pas

1. Vérifier que l'utilisateur est connecté
2. Vérifier la console : `useNotifications hook`
3. Vérifier Firestore : collection `notifications`

### Les SMS ne sont pas envoyés

1. Vérifier les variables Twilio dans `.env.local`
2. Vérifier les logs : `Service SMS Twilio initialisé`
3. Vérifier le crédit Twilio
4. Vérifier le format du numéro : `+229XXXXXXXX`

### Les emails ne sont pas envoyés

1. Vérifier les variables EMAIL dans `.env.local`
2. Pour Gmail : vérifier le mot de passe d'application
3. Vérifier les logs : `Service Email Nodemailer initialisé`
4. Tester avec un email simple

### Les cron jobs ne s'exécutent pas

1. Vérifier que `initializeCronJobs()` est appelé dans `layout.js`
2. Vérifier les logs au démarrage : `Cron jobs démarrés`
3. Vérifier la timezone : `Africa/Porto-Novo`
4. Pour production : utiliser un service externe (cron-job.org)

### Erreur "Service non configuré"

C'est normal si les variables d'environnement ne sont pas définies. Les services fonctionnent en mode "mock" et logguent dans la console.

---

## 💰 Coûts estimés

| Service | Coût | Limite gratuite |
|---------|------|-----------------|
| **Twilio SMS** | 0.05$/SMS | Aucune |
| **Nodemailer (Gmail)** | Gratuit | 500 emails/jour |
| **Firebase** | Gratuit | Plan Spark suffisant |
| **Cron-job.org** | Gratuit | 20 jobs |

**Total estimé** : **10-20$/mois** pour 300-400 SMS

---

## 📊 Statistiques

Le système génère automatiquement des statistiques :

- Nombre de notifications envoyées
- Taux d'ouverture des notifications
- CPN en retard / à venir
- Nouvelles patientes
- Accouchements

Consultables dans le dashboard.

---

## 🎨 Personnalisation

### Modifier les horaires des cron jobs

Dans `src/services/cronService.js` :

```javascript
// Rappels à 7h au lieu de 8h
cron.schedule('0 7 * * *', async () => { ... });

// Récap à 17h au lieu de 18h
cron.schedule('0 17 * * *', async () => { ... });
```

### Modifier les templates d'email

Dans `src/services/emailService.js`, méthode `createCpnReminderTemplate()`.

### Ajouter de nouveaux types de notifications

1. Ajouter le type dans `notificationService.js`
2. Créer la méthode d'envoi
3. Ajouter dans le cron si nécessaire

---

## ✅ Checklist de déploiement

- [ ] Configurer les variables d'environnement
- [ ] Tester les notifications in-app
- [ ] Tester l'envoi de SMS
- [ ] Tester l'envoi d'emails
- [ ] Configurer cron-job.org (ou équivalent)
- [ ] Vérifier les logs en production
- [ ] Monitorer les coûts Twilio
- [ ] Former les sages-femmes à l'utilisation

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs de l'application
2. Vérifier la configuration des variables d'environnement
3. Tester manuellement via les API endpoints

---

**🎉 Félicitations ! Le système de notifications est maintenant opérationnel !**
