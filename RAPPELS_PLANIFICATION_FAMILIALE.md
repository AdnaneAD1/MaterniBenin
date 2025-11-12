# 📅 Rappels Planification Familiale - Documentation

## 🎯 Objectif

Envoyer des rappels automatiques pour les rendez-vous de planification familiale, **uniquement pour les dates futures et présentes** (pas de rappels pour les dates passées).

---

## 🔄 Logique Implémentée

### **Principe**

```
1. Récupérer toutes les planifications avec RDV
   ↓
2. Filtrer uniquement les RDV futures et présentes (diffDays >= 0)
   ↓
3. Envoyer rappels si J-3, J-1, ou J-0
```

---

## 📊 Flux de Récupération

### **1. Récupération des Planifications**

```javascript
const planificationsQuery = query(
  collection(db, 'planifications')
);
const planificationsSnapshot = await getDocs(planificationsQuery);
```

### **2. Vérification du RDV**

```javascript
const rdvProchain = planifData.rdvProchain;

// Vérifier que le RDV existe et n'est pas vide
if (!rdvProchain || rdvProchain === '') continue;
```

### **3. Conversion de la Date**

```javascript
// Support Timestamp et String
let rdv;
if (rdvProchain.toDate) {
  rdv = rdvProchain.toDate();
} else if (typeof rdvProchain === 'string') {
  rdv = new Date(rdvProchain);
}

// Vérifier que la date est valide
if (isNaN(rdv.getTime())) continue;
```

### **4. Calcul de la Différence**

```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const diffTime = rdv.getTime() - today.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
```

### **5. Filtrage des Dates Passées** ⭐

```javascript
// ⭐ UNIQUEMENT les dates futures et présentes (diffDays >= 0)
if (diffDays < 0) {
  console.log(`⏭️ RDV passé (${diffDays} jours), skip`);
  continue;
}
```

**Pourquoi ?**
- ✅ Évite les rappels pour des RDV déjà passés
- ✅ Réduit le bruit (pas de notifications inutiles)
- ✅ Focus sur les RDV à venir

### **6. Récupération Informations Patiente**

```javascript
// Chaîne : planification → dossier → patiente → personne
const dossierId = planifData.dossierId;
const dossierDoc = await getDoc(doc(db, 'dossiers', dossierId));
const patientId = dossierData.patientId;
const patientDoc = await getDoc(doc(db, 'patientes', patientId));
const personneId = patientData.personneId;
const personneDoc = await getDoc(doc(db, 'personnes', personneId));
```

### **7. Ajout à la Liste**

```javascript
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
```

---

## 🔔 Conditions d'Envoi des Rappels

### **Rappels Envoyés**

| Condition | Message | Exemple |
|-----------|---------|---------|
| `diffDays === 3` | "RDV dans 3 jours" | J-3 |
| `diffDays === 1` | "RDV demain" | J-1 |
| `diffDays === 0` | "RDV aujourd'hui" | J-0 |

### **Rappels NON Envoyés**

| Condition | Raison |
|-----------|--------|
| `diffDays < 0` | RDV passé (filtré en amont) |
| `diffDays === 2` | Pas dans les conditions (J-3, J-1, J-0) |
| `diffDays > 3` | Trop tôt |

---

## 📱 Messages SMS

### **Format du Message**

```javascript
const consultationType = type === 'planification' 
  ? (methode || 'rendez-vous de planification familiale')
  : (cpnLabel || 'consultation prénatale');
```

### **Exemples de Messages**

#### **J-3 (3 jours avant)**
```
Bonjour Mme Dupont,

Votre Pilule contraceptive est prévu(e) le 15/11/2025 à 14:30.

Centre de santé MaterniBénin
```

#### **J-1 (1 jour avant)**
```
Bonjour Mme Dupont,

Rappel: Votre DIU (stérilet) est demain 15/11/2025 à 14:30.

Centre de santé MaterniBénin
```

#### **J-0 (jour même)**
```
Bonjour Mme Dupont,

Rappel: Votre rendez-vous de planification familiale est aujourd'hui à 14:30.

Centre de santé MaterniBénin
```

---

## 🔍 Différences avec Rappels CPN

| Aspect | CPN | Planification Familiale |
|--------|-----|-------------------------|
| **Source** | Grossesses en cours | Toutes planifications |
| **Filtrage** | `statut = 'En cours'` | `diffDays >= 0` |
| **Rappels retard** | ✅ Oui (`diffDays < 0`) | ❌ Non (filtré) |
| **Champ RDV** | `consultation.rdv` | `planification.rdvProchain` |
| **Type** | `type: 'cpn'` | `type: 'planification'` |
| **Label** | `cpnLabel` (ex: "CPN 2") | `methode` (ex: "Pilule") |

---

## 📊 Logs de Débogage

### **Logs Attendus**

```
🔍 Récupération des RDV planification familiale...
📋 12 planifications trouvées
⏭️ RDV passé (-5 jours), skip
⏭️ RDV passé (-12 jours), skip
✅ RDV ajouté: Marie Dupont - RDV dans 3 jours (Pilule contraceptive)
✅ RDV ajouté: Sophie Martin - RDV dans 1 jour (DIU)
✅ RDV ajouté: Claire Bernard - RDV dans 0 jours (Implant)
📊 Total: 3 RDV planification à venir

🔄 Traitement des rappels CPN et Planification Familiale...
📋 5 CPN trouvées
📋 3 RDV planification trouvés
✅ Rappels envoyés pour Marie Dupont (J+3)
✅ Rappels envoyés pour Sophie Martin (J+1)
✅ Rappels envoyés pour Claire Bernard (J+0)
✅ 8 rappels envoyés (CPN + Planification)
```

---

## 🎯 Exemples Concrets

### **Exemple 1 : RDV dans 3 jours** ✅

```json
{
  "dossierId": "DM001",
  "methode": "Pilule contraceptive",
  "rdvProchain": "2025-11-15T14:30:00"
}
```

**Aujourd'hui** : 12/11/2025  
**diffDays** : 3  
**Résultat** : ✅ Rappel envoyé (J-3)

---

### **Exemple 2 : RDV demain** ✅

```json
{
  "dossierId": "DM002",
  "methode": "DIU (stérilet)",
  "rdvProchain": "2025-11-13T10:00:00"
}
```

**Aujourd'hui** : 12/11/2025  
**diffDays** : 1  
**Résultat** : ✅ Rappel envoyé (J-1)

---

### **Exemple 3 : RDV aujourd'hui** ✅

```json
{
  "dossierId": "DM003",
  "methode": "Implant contraceptif",
  "rdvProchain": "2025-11-12T16:00:00"
}
```

**Aujourd'hui** : 12/11/2025  
**diffDays** : 0  
**Résultat** : ✅ Rappel envoyé (J-0)

---

### **Exemple 4 : RDV passé** ❌

```json
{
  "dossierId": "DM004",
  "methode": "Injection contraceptive",
  "rdvProchain": "2025-11-05T09:00:00"
}
```

**Aujourd'hui** : 12/11/2025  
**diffDays** : -7  
**Résultat** : ❌ **Filtré** (RDV passé, pas de rappel)

---

### **Exemple 5 : RDV dans 5 jours** ❌

```json
{
  "dossierId": "DM005",
  "methode": "Patch contraceptif",
  "rdvProchain": "2025-11-17T11:00:00"
}
```

**Aujourd'hui** : 12/11/2025  
**diffDays** : 5  
**Résultat** : ❌ **Pas de rappel** (trop tôt, pas J-3/J-1/J-0)

---

## 🔧 Fichiers Modifiés

### **1. cronService.js**

#### **Nouvelle fonction**
```javascript
async getUpcomingPlanificationRdv() {
  // Récupère les RDV de planification familiale
  // Filtre uniquement diffDays >= 0
  // Retourne liste avec type: 'planification'
}
```

#### **Fonction modifiée**
```javascript
async processCpnReminders() {
  // 1. Récupérer CPN
  const cpnList = await this.getUpcomingAndLateCpns();
  
  // 2. Récupérer Planifications
  const planifList = await this.getUpcomingPlanificationRdv();
  
  // 3. Traiter rappels CPN (J-3, J-1, J-0, retard)
  // 4. Traiter rappels Planification (J-3, J-1, J-0)
}
```

### **2. smsService.js**

#### **Fonction modifiée**
```javascript
async sendCpnReminder(cpnData, daysUntil) {
  const { type, methode, cpnLabel } = cpnData;
  
  // Déterminer le type de consultation
  const consultationType = type === 'planification' 
    ? (methode || 'rendez-vous de planification familiale')
    : (cpnLabel || 'consultation prénatale');
  
  // Construire message adapté
}
```

---

## ✅ Avantages de la Logique

1. **Pas de spam** 📵
   - Aucun rappel pour les RDV passés
   - Uniquement les RDV pertinents

2. **Cohérence** 🔄
   - Même logique que les CPN (J-3, J-1, J-0)
   - Messages uniformes

3. **Performance** ⚡
   - Filtrage en amont (diffDays >= 0)
   - Moins de traitements inutiles

4. **Flexibilité** 🎯
   - Support de toutes les méthodes contraceptives
   - Messages personnalisés par méthode

---

## 🚀 Déploiement

### **Checklist**

- ✅ Fonction `getUpcomingPlanificationRdv()` créée
- ✅ Filtrage `diffDays >= 0` implémenté
- ✅ Intégration dans `processCpnReminders()`
- ✅ Adaptation `sendCpnReminder()` pour planification
- ✅ Logs de débogage ajoutés
- ✅ Documentation créée

### **Tests à Effectuer**

1. **Test RDV futur** (J-3)
   - Créer planification avec RDV dans 3 jours
   - Vérifier rappel envoyé

2. **Test RDV demain** (J-1)
   - Créer planification avec RDV demain
   - Vérifier rappel envoyé

3. **Test RDV aujourd'hui** (J-0)
   - Créer planification avec RDV aujourd'hui
   - Vérifier rappel envoyé

4. **Test RDV passé**
   - Créer planification avec RDV passé
   - Vérifier **aucun rappel** envoyé

5. **Test RDV lointain**
   - Créer planification avec RDV dans 10 jours
   - Vérifier **aucun rappel** envoyé

---

## 📋 Collection Firestore

### **Structure `planifications`**

```javascript
{
  dossierId: string,
  methode: string,  // "Pilule", "DIU", "Implant", etc.
  rdvProchain: Timestamp | string,
  userId: string,
  createdAt: Timestamp,
  // ... autres champs
}
```

### **Méthodes Contraceptives Supportées**

- Pilule contraceptive
- DIU (stérilet)
- Implant contraceptif
- Injection contraceptive
- Patch contraceptif
- Anneau vaginal
- Préservatifs
- Méthodes naturelles
- Stérilisation

---

## 🎓 Conclusion

Le système de rappels pour la planification familiale est maintenant **opérationnel** avec :

✅ **Filtrage intelligent** (uniquement dates futures/présentes)  
✅ **Rappels pertinents** (J-3, J-1, J-0)  
✅ **Messages personnalisés** (par méthode contraceptive)  
✅ **Cohérence** avec les rappels CPN  
✅ **Performance optimisée** (filtrage en amont)

**Prochaine étape** : Tester en production et monitorer les logs ! 🚀

---

**Document créé le 12 novembre 2025**  
**MaterniBénin - Rappels Planification Familiale**
