# Système de Génération Automatique des Rapports Mensuels

## 📋 Vue d'ensemble

Le système de génération automatique des rapports mensuels a été intégré dans l'application BeninSante pour automatiser la création des rapports de fin de mois. Ce système fonctionne à deux niveaux :

1. **Génération automatique côté client** : Quand l'application est utilisée
2. **Génération automatique côté serveur** : Même quand l'application n'est pas utilisée (via cron jobs)

## 🏗️ Architecture

### Composants principaux

1. **`useAutoReports` Hook** (`/src/hooks/useAutoReports.js`)
   - Gère la logique de génération automatique côté client
   - Vérifie chaque heure si c'est le dernier jour du mois après 22h
   - Affiche des notifications pour informer l'utilisateur

2. **API Route Cron** (`/src/app/api/cron/monthly-reports/route.js`)
   - Endpoint pour la génération automatique via cron jobs
   - Sécurisé par un token (CRON_SECRET)
   - Génère les rapports CPN, Accouchement et Planification familiale

3. **DashboardLayout Integration** (`/src/components/layout/DashboardLayout.js`)
   - Intègre le hook `useAutoReports`
   - Affiche les notifications de génération automatique

4. **AutoReportNotification** (`/src/components/ui/AutoReportNotification.js`)
   - Composant de notification élégant
   - Affiche les résultats de génération automatique
   - Auto-fermeture après 10 secondes

5. **AutoReportTester** (`/src/components/admin/AutoReportTester.js`)
   - Outil de test pour les administrateurs
   - Permet de tester manuellement la génération
   - Vérification de l'état de l'endpoint

## ⚙️ Configuration

### Variables d'environnement

Ajoutez ces variables à votre `.env.local` :

```env
# URL de votre application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret pour sécuriser l'endpoint de cron (recommandé)
CRON_SECRET=your-super-secret-cron-key-here
```

### Configuration du Cron Job

#### Option 1: Cron Linux/macOS
```bash
# Dernier jour de chaque mois à 23:30
30 23 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && curl -X POST -H "Authorization: Bearer your-secret" http://localhost:3000/api/cron/monthly-reports
```

#### Option 2: Windows Task Scheduler
Créez une tâche planifiée qui exécute :
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cron/monthly-reports" -Method POST -Headers @{"Authorization"="Bearer your-secret"}
```

#### Option 3: Services en ligne
- **Vercel Cron Jobs** (si déployé sur Vercel)
- **GitHub Actions** avec cron schedule
- **EasyCron.com** ou **Cron-job.org**

## 🔄 Fonctionnement

### Logique de génération

1. **Vérification temporelle** : Le système vérifie si c'est le dernier jour du mois après 22h
2. **Vérification des doublons** : Seuls les rapports manquants sont générés
3. **Types de rapports** : CPN, Accouchement, Planification familiale
4. **Notification** : L'utilisateur est informé des rapports générés

### Flux de données

```
DashboardLayout → useAutoReports → API Route → Firebase → Notification
```

## 🧪 Tests

### Test manuel via l'interface

1. Allez sur la page **Rapports** (`/dashboard/rapports`)
2. Utilisez le composant **"Test Génération Automatique"**
3. Cliquez sur **"Tester Génération"** pour un test manuel
4. Cliquez sur **"Vérifier Endpoint"** pour tester la connectivité

### Test via API

```bash
# Test de l'endpoint
curl -X GET "http://localhost:3000/api/cron/monthly-reports?test=true"

# Génération manuelle
curl -X POST \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/cron/monthly-reports"
```

## 📊 Monitoring

### Logs à surveiller

```bash
# Logs de génération automatique
🔄 Génération automatique des rapports mensuels...
✅ Rapports mensuels générés avec succès
❌ Erreur lors de la génération des rapports

# Logs de l'API
📅 Génération des rapports pour [Mois] [Année]
📊 Types de rapports à générer: [Types]
📈 Résultats: X/Y rapports générés avec succès
```

### Surveillance recommandée

1. **Logs d'application** : Vérifiez les logs pour les erreurs
2. **Base de données** : Surveillez la création des rapports
3. **Notifications** : Vérifiez que les utilisateurs reçoivent les notifications
4. **Performance** : Surveillez le temps de génération des rapports

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Token d'authentification** : L'endpoint cron est protégé par CRON_SECRET
2. **Validation des données** : Vérification des paramètres d'entrée
3. **Gestion d'erreurs** : Capture et logging des erreurs
4. **Limitation d'accès** : Seuls les utilisateurs connectés peuvent déclencher manuellement

### Bonnes pratiques

- Utilisez un CRON_SECRET fort et unique
- Surveillez les logs pour détecter les tentatives d'accès non autorisées
- Limitez l'accès au composant de test aux administrateurs
- Sauvegardez régulièrement les rapports générés

## 🚀 Déploiement

### Étapes de déploiement

1. **Variables d'environnement** : Configurez NEXT_PUBLIC_APP_URL et CRON_SECRET
2. **Cron job** : Configurez le cron job selon votre environnement
3. **Tests** : Testez la génération manuelle et automatique
4. **Monitoring** : Mettez en place la surveillance des logs

### Vérifications post-déploiement

- [ ] L'endpoint `/api/cron/monthly-reports` répond correctement
- [ ] Le cron job est configuré et actif
- [ ] Les notifications s'affichent correctement
- [ ] Les rapports sont générés dans Firebase
- [ ] Les logs sont visibles et informatifs

## 🐛 Dépannage

### Problèmes courants

1. **Rapports non générés**
   - Vérifiez les logs de l'application
   - Testez l'endpoint manuellement
   - Vérifiez la configuration du cron job

2. **Notifications non affichées**
   - Vérifiez que l'utilisateur est connecté
   - Vérifiez les logs de la console
   - Testez avec le composant de test

3. **Erreurs d'API**
   - Vérifiez NEXT_PUBLIC_APP_URL
   - Vérifiez la connectivité Firebase
   - Vérifiez les permissions

### Support

Pour obtenir de l'aide :
1. Consultez les logs de l'application
2. Utilisez le composant de test pour diagnostiquer
3. Vérifiez la configuration des variables d'environnement
4. Testez manuellement l'endpoint API

## 📈 Améliorations futures

### Fonctionnalités possibles

- [ ] Interface d'administration pour configurer les horaires
- [ ] Notifications par email des rapports générés
- [ ] Historique détaillé des générations automatiques
- [ ] Rapports personnalisés selon les besoins
- [ ] Intégration avec des services de monitoring externes

### Optimisations

- [ ] Cache des données pour améliorer les performances
- [ ] Génération asynchrone pour les gros volumes
- [ ] Compression des rapports PDF
- [ ] Archivage automatique des anciens rapports
