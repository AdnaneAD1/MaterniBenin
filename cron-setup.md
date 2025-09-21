# Configuration du Cron Job pour la Génération Automatique des Rapports

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# URL de votre application (pour les appels API internes)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret pour sécuriser l'endpoint de cron (optionnel mais recommandé)
CRON_SECRET=your-super-secret-cron-key-here
```

## Configuration du Cron Job

### Option 1: Cron Job Linux/macOS

Ajoutez cette ligne à votre crontab (`crontab -e`) :

```bash
# Exécuter le dernier jour de chaque mois à 23:30
30 23 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && curl -X POST -H "Authorization: Bearer your-super-secret-cron-key-here" http://localhost:3000/api/cron/monthly-reports
```

### Option 2: Cron Job Windows (Task Scheduler)

Créez une tâche planifiée qui exécute ce script PowerShell :

```powershell
# monthly-reports.ps1
$headers = @{
    "Authorization" = "Bearer your-super-secret-cron-key-here"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/cron/monthly-reports" -Method POST -Headers $headers
Write-Output $response
```

Planifiez cette tâche pour s'exécuter le dernier jour de chaque mois à 23:30.

### Option 3: Service de Cron en ligne

Si votre application est déployée, vous pouvez utiliser des services comme :

- **Vercel Cron Jobs** (si déployé sur Vercel)
- **GitHub Actions** avec cron schedule
- **EasyCron.com**
- **Cron-job.org**

Exemple de configuration pour ces services :
- URL: `https://votre-domaine.com/api/cron/monthly-reports`
- Méthode: POST
- Headers: `Authorization: Bearer your-super-secret-cron-key-here`
- Fréquence: `30 23 L * *` (dernier jour du mois à 23:30)

## Test de l'endpoint

Pour tester manuellement la génération des rapports :

```bash
# Test de l'endpoint
curl -X GET "http://localhost:3000/api/cron/monthly-reports?test=true"

# Génération manuelle des rapports
curl -X POST \
  -H "Authorization: Bearer your-super-secret-cron-key-here" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/cron/monthly-reports"
```

## Fonctionnement

1. **Vérification automatique** : Le système vérifie chaque heure si c'est le dernier jour du mois après 22h
2. **Génération intelligente** : Seuls les rapports manquants sont générés (évite les doublons)
3. **Types de rapports** : CPN, Accouchement, Planification familiale
4. **Logs détaillés** : Toutes les opérations sont loggées pour le débogage
5. **Gestion d'erreurs** : Les erreurs sont capturées et loggées sans interrompre le processus

## Sécurité

- L'endpoint est protégé par un secret (CRON_SECRET)
- Seuls les rapports du mois précédent sont générés
- Vérification des doublons avant génération
- Logs détaillés pour audit

## Monitoring

Surveillez les logs de votre application pour vérifier que les rapports sont générés correctement :

```bash
# Rechercher les logs de génération automatique
grep "Génération automatique des rapports" logs/app.log
```
