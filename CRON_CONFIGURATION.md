# 🕐 Configuration des Cron Jobs pour les Rappels CPN

Ce guide explique comment configurer les tâches automatiques (cron jobs) pour envoyer des rappels CPN automatiques.

---

## 📋 Vue d'ensemble

Le système de rappels CPN comprend **3 tâches automatiques** :

1. **Rappels CPN quotidiens** (8h00) - Envoie des rappels aux patientes
2. **Récapitulatif journalier** (18h00) - Envoie un résumé aux sages-femmes
3. **Récapitulatif hebdomadaire** (Lundi 9h00) - Envoie un rapport hebdomadaire

---

## 🔧 Prérequis

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Twilio (SMS) - Optionnel
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+229XXXXXXXX

# Email (Nodemailer) - Optionnel
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
EMAIL_FROM_NAME=MaterniBénin

# Cron Secret - OBLIGATOIRE
CRON_SECRET=votre_cle_secrete_32_caracteres_minimum
```

### 2. Générer un CRON_SECRET

```bash
# Option 1 : Générer une clé aléatoire (recommandé)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2 : Utiliser un générateur en ligne
# https://www.random.org/strings/
```

**Important** : Gardez cette clé secrète et ne la partagez jamais !

---

## 🌐 Option 1 : Cron-job.org (Recommandé - Gratuit)

### Étape 1 : Créer un compte

1. Allez sur [https://cron-job.org](https://cron-job.org)
2. Créez un compte gratuit
3. Confirmez votre email

### Étape 2 : Déployer votre application

Déployez d'abord votre application Next.js sur :
- **Vercel** (recommandé) : [https://vercel.com](https://vercel.com)
- **Netlify** : [https://netlify.com](https://netlify.com)
- **Railway** : [https://railway.app](https://railway.app)

Notez l'URL de votre application déployée (ex: `https://votre-app.vercel.app`)

### Étape 3 : Configurer les variables d'environnement

Dans votre plateforme de déploiement, ajoutez toutes les variables d'environnement du fichier `.env.local`.

### Étape 4 : Créer les 3 cron jobs

#### Job 1 : Rappels CPN quotidiens

1. Cliquez sur **"Create cronjob"**
2. Remplissez :
   - **Title** : `Rappels CPN quotidiens`
   - **Address** : `https://votre-app.vercel.app/api/cron/reminders?secret=VOTRE_CRON_SECRET`
   - **Schedule** : 
     - Type : **Every day**
     - Time : **08:00** (heure locale Bénin)
   - **Request method** : `GET`
   - **Timezone** : `Africa/Porto-Novo` (UTC+1)
3. Cliquez sur **"Create"**

#### Job 2 : Récapitulatif journalier

1. Cliquez sur **"Create cronjob"**
2. Remplissez :
   - **Title** : `Récapitulatif journalier`
   - **Address** : `https://votre-app.vercel.app/api/cron/daily-summary?secret=VOTRE_CRON_SECRET`
   - **Schedule** : 
     - Type : **Every day**
     - Time : **18:00**
   - **Request method** : `GET`
   - **Timezone** : `Africa/Porto-Novo`
3. Cliquez sur **"Create"**

#### Job 3 : Récapitulatif hebdomadaire

1. Cliquez sur **"Create cronjob"**
2. Remplissez :
   - **Title** : `Récapitulatif hebdomadaire`
   - **Address** : `https://votre-app.vercel.app/api/cron/weekly-summary?secret=VOTRE_CRON_SECRET`
   - **Schedule** : 
     - Type : **Every week**
     - Day : **Monday**
     - Time : **09:00**
   - **Request method** : `GET`
   - **Timezone** : `Africa/Porto-Novo`
3. Cliquez sur **"Create"**

### Étape 5 : Tester les cron jobs

1. Dans cron-job.org, cliquez sur chaque job
2. Cliquez sur **"Run now"** pour tester
3. Vérifiez les logs dans l'onglet **"History"**

---

## 🖥️ Option 2 : Serveur Linux avec Crontab

Si vous avez un serveur Linux (VPS, Raspberry Pi, etc.) :

### Étape 1 : Ouvrir crontab

```bash
crontab -e
```

### Étape 2 : Ajouter les 3 tâches

```bash
# Rappels CPN quotidiens (8h00)
0 8 * * * curl -X GET "https://votre-app.vercel.app/api/cron/reminders?secret=VOTRE_CRON_SECRET"

# Récapitulatif journalier (18h00)
0 18 * * * curl -X GET "https://votre-app.vercel.app/api/cron/daily-summary?secret=VOTRE_CRON_SECRET"

# Récapitulatif hebdomadaire (Lundi 9h00)
0 9 * * 1 curl -X GET "https://votre-app.vercel.app/api/cron/weekly-summary?secret=VOTRE_CRON_SECRET"
```

### Étape 3 : Sauvegarder et quitter

```bash
# Appuyez sur Ctrl+X, puis Y, puis Entrée
```

### Étape 4 : Vérifier que les tâches sont enregistrées

```bash
crontab -l
```

---

## 🧪 Tester les rappels manuellement

Vous pouvez tester les rappels directement depuis votre navigateur ou avec curl :

### Test 1 : Rappels CPN

```bash
curl "https://votre-app.vercel.app/api/cron/reminders?secret=VOTRE_CRON_SECRET"
```

Ou ouvrez dans le navigateur :
```
https://votre-app.vercel.app/api/cron/reminders?secret=VOTRE_CRON_SECRET
```

### Test 2 : Récapitulatif journalier

```bash
curl "https://votre-app.vercel.app/api/cron/daily-summary?secret=VOTRE_CRON_SECRET"
```

### Test 3 : Récapitulatif hebdomadaire

```bash
curl "https://votre-app.vercel.app/api/cron/weekly-summary?secret=VOTRE_CRON_SECRET"
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Rappels CPN envoyés avec succès",
  "stats": {
    "total": 5,
    "sent": 5,
    "failed": 0
  }
}
```

---

## 📊 Vérifier les logs

### Dans votre application Next.js

Les logs sont affichés dans la console de votre serveur. Pour Vercel :

1. Allez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **"Logs"**
4. Filtrez par `/api/cron/`

### Dans cron-job.org

1. Connectez-vous à [https://cron-job.org](https://cron-job.org)
2. Cliquez sur un job
3. Allez dans l'onglet **"History"**
4. Vérifiez le statut (✅ Success ou ❌ Failed)

---

## 🔍 Dépannage

### Problème : "Invalid secret"

**Cause** : Le `CRON_SECRET` dans l'URL ne correspond pas à celui dans `.env.local`

**Solution** :
1. Vérifiez que `CRON_SECRET` est bien défini dans les variables d'environnement de votre plateforme de déploiement
2. Vérifiez que l'URL contient le bon secret : `?secret=VOTRE_CRON_SECRET`

### Problème : "No reminders to send"

**Cause** : Aucune CPN avec RDV dans les 3 prochains jours

**Solution** : C'est normal ! Ajoutez des consultations CPN avec des dates de RDV pour tester.

### Problème : SMS non envoyés

**Cause** : Twilio non configuré ou numéros invalides

**Solution** :
1. Vérifiez que `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_PHONE_NUMBER` sont définis
2. Vérifiez que les numéros de téléphone des patientes sont au format béninois (8 chiffres)
3. Consultez les logs pour voir les erreurs Twilio

### Problème : Emails non envoyés

**Cause** : Nodemailer non configuré

**Solution** :
1. Vérifiez que `EMAIL_HOST`, `EMAIL_USER` et `EMAIL_PASS` sont définis
2. Pour Gmail, utilisez un **mot de passe d'application** (pas votre mot de passe normal)
3. Activez la validation en 2 étapes sur Gmail

---

## 🔐 Sécurité

### Bonnes pratiques

1. ✅ **Ne jamais** commiter le fichier `.env.local` dans Git
2. ✅ Utiliser un `CRON_SECRET` long et aléatoire (32+ caractères)
3. ✅ Changer le `CRON_SECRET` régulièrement (tous les 3-6 mois)
4. ✅ Limiter l'accès aux variables d'environnement
5. ✅ Monitorer les logs pour détecter les accès non autorisés

### Que faire si le secret est compromis ?

1. Générez un nouveau `CRON_SECRET`
2. Mettez à jour la variable d'environnement sur votre plateforme de déploiement
3. Mettez à jour les URLs dans cron-job.org avec le nouveau secret
4. Redéployez votre application

---

## 💰 Coûts estimés

### Gratuit
- ✅ Cron-job.org (plan gratuit : 20 jobs)
- ✅ Vercel (plan gratuit : suffisant pour petits projets)
- ✅ Nodemailer avec Gmail (500 emails/jour gratuits)

### Payant
- 💰 Twilio SMS : ~0.05$/SMS
  - 10 SMS/jour × 30 jours = ~15$/mois
  - 50 SMS/jour × 30 jours = ~75$/mois

**Total estimé** : **0-75$/mois** selon le volume de SMS

---

## 📅 Calendrier des rappels

### Rappels CPN quotidiens (8h00)

Le système envoie des rappels pour :
- **J-3** : "Votre CPN est dans 3 jours"
- **J-1** : "Votre CPN est demain"
- **J-0** : "Votre CPN est aujourd'hui"
- **Retard** : "Votre CPN est en retard"

### Récapitulatif journalier (18h00)

Envoyé aux sages-femmes avec :
- Nombre de CPN aujourd'hui
- Nombre de CPN en retard
- Nombre de CPN à venir (7 jours)

### Récapitulatif hebdomadaire (Lundi 9h00)

Envoyé aux sages-femmes avec :
- Total CPN de la semaine
- CPN en retard
- CPN planifiées
- Statistiques détaillées

---

## ✅ Checklist de configuration

- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] `CRON_SECRET` généré et sécurisé
- [ ] Application déployée (Vercel/Netlify/Railway)
- [ ] Variables d'environnement ajoutées sur la plateforme de déploiement
- [ ] Compte cron-job.org créé
- [ ] 3 cron jobs créés et configurés
- [ ] Tests manuels effectués (rappels, récap journalier, récap hebdomadaire)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Twilio configuré (optionnel)
- [ ] Nodemailer configuré (optionnel)
- [ ] Numéros de téléphone des patientes vérifiés
- [ ] Emails des sages-femmes vérifiés

---

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** dans Vercel/Netlify
2. **Vérifiez l'historique** dans cron-job.org
3. **Testez manuellement** les endpoints avec curl
4. **Vérifiez les variables d'environnement**
5. **Consultez la documentation** Twilio/Nodemailer

---

## 🎉 Félicitations !

Une fois configuré, le système enverra automatiquement des rappels CPN sans intervention manuelle ! 🚀

Les patientes recevront des SMS/emails de rappel, et les sages-femmes recevront des récapitulatifs réguliers.
