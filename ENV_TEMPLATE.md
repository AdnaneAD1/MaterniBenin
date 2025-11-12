# Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# ========================================
# TWILIO (SMS)
# ========================================
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+229XXXXXXXX

# ========================================
# EMAIL (Nodemailer)
# ========================================
# Pour Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
EMAIL_FROM_NAME=MaterniBénin

# Pour autres fournisseurs (exemples)
# Outlook: smtp-mail.outlook.com:587
# Yahoo: smtp.mail.yahoo.com:587
# Custom SMTP: votre_serveur_smtp:port

# ========================================
# CRON JOBS
# ========================================
# Clé secrète pour sécuriser les endpoints cron
CRON_SECRET=votre_cle_secrete_aleatoire

# ========================================
# FIREBASE (déjà configuré)
# ========================================
# Vos variables Firebase existantes...
```

## 📝 Instructions de configuration

### 1. Twilio (SMS)

1. Créer un compte sur [twilio.com](https://www.twilio.com)
2. Aller dans Console → Account Info
3. Copier `Account SID` et `Auth Token`
4. Acheter un numéro de téléphone Twilio
5. Ajouter les variables dans `.env.local`

**Coût estimé** : ~1$/mois + 0.05$/SMS

### 2. Email (Nodemailer avec Gmail)

#### Option A : Gmail (Recommandé pour test)

1. Activer la validation en 2 étapes sur votre compte Google
2. Aller dans [Mots de passe d'application](https://myaccount.google.com/apppasswords)
3. Créer un mot de passe pour "Mail"
4. Utiliser ce mot de passe dans `EMAIL_PASS`

#### Option B : Autre fournisseur SMTP

Utilisez les paramètres SMTP de votre fournisseur d'email.

**Coût** : Gratuit (Gmail permet ~500 emails/jour)

### 3. Cron Secret

Générez une clé aléatoire sécurisée :

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 🔒 Sécurité

- ⚠️ **Ne jamais commiter le fichier `.env.local`**
- ✅ Le fichier est déjà dans `.gitignore`
- ✅ Utilisez des mots de passe d'application, pas vos mots de passe principaux
- ✅ Changez le `CRON_SECRET` régulièrement

## 🧪 Test de configuration

Pour tester si tout fonctionne :

```bash
# Démarrer l'application
npm run dev

# Dans un autre terminal, tester les endpoints
curl http://localhost:3000/api/cron/reminders?secret=votre_cle_secrete
```
