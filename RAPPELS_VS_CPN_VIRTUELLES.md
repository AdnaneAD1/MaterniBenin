# 🔔 Rappels CPN vs CPN Virtuelles - Différences et Fonctionnement

## 📋 Vue d'ensemble

Le système comprend **2 fonctionnalités distinctes** qui utilisent la même source de données mais avec des objectifs différents :

1. **Rappels CPN** (`cronService.js`) → Envoyer des notifications/SMS/emails
2. **CPN Virtuelles** (`patientes.js`) → Afficher les prochains RDV dans l'interface

---

## 🔄 1. Rappels CPN (Notifications automatiques)

### **Objectif**
Envoyer des rappels automatiques aux patientes et sages-femmes pour les RDV à venir ou en retard.

### **Fichier**
`/src/services/cronService.js`

### **Fonction principale**
`getUpcomingAndLateCpns()` + `processCpnReminders()`

### **Logique**

```
1. Récupérer grossesses en cours (statut = "En cours")
   ↓
2. Pour chaque grossesse :
   - Récupérer les CPN
   - Récupérer les consultations avec RDV
   - Trier par date (plus récente en premier)
   - Prendre UNIQUEMENT la dernière consultation
   ↓
3. Calculer diffDays (jours avant/après RDV)
   ↓
4. Envoyer rappels SI :
   - J-3 (3 jours avant)
   - J-1 (1 jour avant)
   - J-0 (jour même)
   - < J-0 (en retard)
```

### **Canaux d'envoi**

Pour chaque CPN qui remplit les conditions :

1. **Notification in-app** (toujours) → Sage-femme
2. **SMS** (si configuré) → Patiente
3. **Email** (si configuré) → Patiente

### **Récapitulatifs**

#### **Récapitulatif journalier** (18h00)
- Envoyé aux **sages-femmes**
- Contenu : Stats (CPN aujourd'hui, en retard, à venir 7j)
- Canal : **SMS uniquement**

#### **Récapitulatif hebdomadaire** (Lundi 9h00)
- Envoyé aux **sages-femmes**
- Contenu : Stats complètes de la semaine
- Canal : **Email uniquement**

### **Exemple de logs**

```
🔍 Récupération des CPN pour grossesses en cours...
📋 4 grossesses en cours trouvées
📌 Grossesse GS001: Dernière consultation avec RDV = C123
✅ CPN ajoutée: Marie Dupont - RDV dans 3 jours
📊 Total: 2 CPN avec RDV trouvées

🔄 Traitement des rappels CPN...
📋 2 CPN trouvées
✅ Rappels envoyés pour Marie Dupont (J+3)
✅ 2 rappels envoyés
```

### **Quand les rappels sont envoyés ?**

| Condition | Action |
|-----------|--------|
| `diffDays === 3` | ✅ Rappel "CPN dans 3 jours" |
| `diffDays === 1` | ✅ Rappel "CPN demain" |
| `diffDays === 0` | ✅ Rappel "CPN aujourd'hui" |
| `diffDays < 0` | ✅ Rappel "CPN en retard" |
| `diffDays === 5` | ❌ Pas de rappel (trop tôt) |

---

## 📱 2. CPN Virtuelles (Affichage interface)

### **Objectif**
Afficher dans l'interface les prochains RDV pour chaque grossesse en cours, même si la CPN n'est pas encore effectuée.

### **Fichier**
`/src/hooks/patientes.js`

### **Fonction principale**
`getCpnConsultations()`

### **Logique**

```
1. Récupérer CPN terminées (collection 'cpns')
   ↓
2. Récupérer grossesses en cours (statut = "En cours")
   ↓
3. Pour chaque grossesse :
   - Récupérer les CPN
   - Récupérer les consultations avec RDV
   - Trier par date (plus récente en premier)
   - Prendre UNIQUEMENT la dernière consultation
   - Vérifier si CPN virtuelle existe déjà
   ↓
4. Calculer statut selon diffDays :
   - diffDays < -7 → "En retard"
   - -7 ≤ diffDays ≤ 7 → "En attente"
   - diffDays > 7 → "Planifié"
   ↓
5. Créer CPN virtuelle avec flag isVirtual: true
```

### **Statuts des CPN**

| Statut | Condition | Badge | Description |
|--------|-----------|-------|-------------|
| **Terminé** | CPN réelle dans Firestore | 🟢 Vert | CPN effectuée |
| **En retard** | `diffDays < -7` | 🔴 Rouge | RDV dépassé de +7j |
| **En attente** | `-7 ≤ diffDays ≤ 7` | 🟡 Jaune | RDV dans les 7j |
| **Planifié** | `diffDays > 7` | 🔵 Bleu | RDV dans +7j |

### **Structure CPN virtuelle**

```javascript
{
  id: `virtual-cpn-${consultationId}`,
  patient: patientInfo,
  rdv: rdvDate,
  status: "Planifié" | "En attente" | "En retard",
  isVirtual: true,  // ⭐ Flag important
  cpnDone: false,
  consultationId: consultationId,
  ageGestationnel: "7 mois",
  grossesseId: grossesseId,
  // Champs médicaux vides
  dormirsurmild: false,
  spNbr: '',
  mebendazole: '',
  ...
}
```

### **Exemple de logs**

```
📋 4 grossesses en cours trouvées

🔍 Traitement grossesse GS001
📌 Dernière consultation avec RDV = C123
✅ Informations patiente récupérées: {...}
=== Traitement consultation C123 ===
rdvDate: 2025-11-15 Type: string
✅ Date RDV valide: Fri Nov 15 2025
Différence en jours: 3
Statut: Planifié (RDV dans 3 jours)
✅ CPN virtuelle créée avec statut: Planifié
```

### **Affichage dans l'interface**

Les CPN virtuelles apparaissent dans :
- ✅ Page `/dashboard/cpn` (liste complète)
- ✅ Dashboard principal (prochaines CPN)
- ✅ Statistiques (compteurs par statut)

---

## 🔍 Différences clés

| Aspect | Rappels CPN | CPN Virtuelles |
|--------|-------------|----------------|
| **Fichier** | `cronService.js` | `patientes.js` |
| **Objectif** | Envoyer notifications | Afficher dans l'interface |
| **Déclenchement** | Cron automatique (8h, 18h) | Chargement page |
| **Destinataires** | Patientes + Sages-femmes | Interface utilisateur |
| **Canaux** | Notif + SMS + Email | Affichage visuel |
| **Conditions** | J-3, J-1, J-0, retard | Tous les RDV |
| **Fréquence** | 1-2x par jour | À chaque chargement |
| **Données retournées** | Liste CPN pour rappels | Liste CPN pour affichage |

---

## ✅ Logique commune

Les deux fonctionnalités partagent la **même logique de base** :

### **1. Partir des grossesses en cours**

```javascript
const grossessesQuery = query(
  collection(db, 'grossesses'),
  where('statut', '==', 'En cours')
);
```

✅ **Pourquoi ?** Seules les grossesses actives ont besoin de rappels/affichage

### **2. Récupérer la dernière consultation avec RDV**

```javascript
// Pour chaque grossesse
for (const grossesseDoc of grossessesSnapshot.docs) {
  // Récupérer toutes les consultations avec RDV
  const consultationsWithRdv = [...];
  
  // Trier par date (plus récente en premier)
  consultationsWithRdv.sort((a, b) => dateB - dateA);
  
  // Prendre uniquement la première (= la plus récente)
  const lastConsultation = consultationsWithRdv[0];
}
```

✅ **Pourquoi ?** Seul le prochain RDV est pertinent (pas les anciens)

### **3. Calculer diffDays**

```javascript
const diffTime = rdv.getTime() - today.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
```

✅ **Pourquoi ?** Permet de déterminer si rappel nécessaire ou quel statut afficher

---

## 🚫 Ce qui a été corrigé

### **Problème initial**

```javascript
// ❌ AVANT : Skip les grossesses avec CPN terminée
const existingCpn = cpnConsultations.find(cpn => cpn.grossesseId === grossesseId);
if (existingCpn) {
  console.log('✅ Grossesse déjà traitée (CPN terminée), skip');
  continue;
}
```

**Problème** : Si une grossesse a une CPN terminée, on ne créait pas de CPN virtuelle pour le prochain RDV.

### **Solution**

```javascript
// ✅ APRÈS : Vérifier si CPN virtuelle existe déjà pour cette consultation
const virtualCpnId = `virtual-cpn-${consultationId}`;
const existingVirtualCpn = cpnConsultations.find(cpn => cpn.id === virtualCpnId);
if (existingVirtualCpn) {
  console.log('⚠️ CPN virtuelle déjà créée pour cette consultation, skip');
  continue;
}
```

**Avantage** : On crée une CPN virtuelle pour chaque grossesse en cours avec RDV, même si elle a déjà des CPN terminées.

---

## 📊 Exemple concret

### **Scénario : Marie a une grossesse en cours**

**Données** :
- Grossesse : GS001 (statut = "En cours")
- CPN 1 : Terminée le 01/09/2025, RDV prévu 15/10/2025
- CPN 2 : Terminée le 10/10/2025, RDV prévu 10/11/2025
- CPN 3 : Terminée le 05/11/2025, RDV prévu **15/11/2025** ⭐

**Aujourd'hui** : 12/11/2025

---

### **1. Rappels CPN (cronService)**

```
🔍 Récupération des CPN pour grossesses en cours...
📋 1 grossesse en cours trouvée

Grossesse GS001:
  - 3 consultations avec RDV trouvées
  - Tri par date...
  - 📌 Dernière consultation = C003 (RDV 15/11/2025)
  - diffDays = 3 jours
  
✅ CPN ajoutée: Marie Dupont - RDV dans 3 jours

🔄 Traitement des rappels CPN...
📋 1 CPN trouvée
✅ Rappels envoyés pour Marie Dupont (J+3)
  - Notification in-app ✅
  - SMS ✅
  - Email ✅
```

**Résultat** : Marie reçoit 1 rappel (J-3) pour le RDV du 15/11

---

### **2. CPN Virtuelles (patientes.js)**

```
📋 1 grossesse en cours trouvée

🔍 Traitement grossesse GS001
  - 3 consultations avec RDV trouvées
  - Tri par date...
  - 📌 Dernière consultation = C003 (RDV 15/11/2025)
  - diffDays = 3 jours
  - Statut: Planifié (RDV dans 3 jours)
  
✅ CPN virtuelle créée avec statut: Planifié
```

**Résultat** : Interface affiche 1 CPN virtuelle (badge bleu "Planifié") pour le RDV du 15/11

---

## 🎯 Résumé

| Fonctionnalité | Quand ? | Qui ? | Quoi ? | Résultat |
|----------------|---------|-------|--------|----------|
| **Rappels CPN** | Cron 8h | Patientes | Notif + SMS + Email | Rappels J-3, J-1, J-0, retard |
| **Récap journalier** | Cron 18h | Sages-femmes | SMS | Stats du jour |
| **Récap hebdomadaire** | Lundi 9h | Sages-femmes | Email | Stats de la semaine |
| **CPN Virtuelles** | Chargement page | Interface | Affichage | Liste CPN avec statuts |

---

## ✅ Checklist finale

- ✅ Rappels CPN : 1 par grossesse (dernière consultation)
- ✅ CPN virtuelles : 1 par grossesse (dernière consultation)
- ✅ Pas de skip si CPN terminée existe
- ✅ Vérification doublon CPN virtuelle
- ✅ Logique cohérente entre les deux systèmes
- ✅ Logs clairs pour débogage

**Tout fonctionne correctement maintenant !** 🎉
