# 🔔 Logique des Rappels CPN - Grossesses en Cours Uniquement

## 📋 Principe

Le système de rappels CPN ne traite **que les grossesses en cours** et ignore complètement les grossesses terminées.

**Important** : Pour chaque grossesse en cours, seule **la dernière consultation avec RDV** (la plus récente) est prise en compte pour les rappels.

---

## 🔄 Flux de récupération des RDV

### **Étape 1 : Filtrer les grossesses en cours**

```javascript
// Récupérer UNIQUEMENT les grossesses avec statut "en_cours"
const grossessesQuery = query(
    collection(db, 'grossesses'),
    where('statut', '==', 'en_cours')  // ✅ Filtre principal
);
```

**Statuts de grossesse** :
- ✅ `en_cours` → **Inclus** dans les rappels
- ❌ `terminée` → **Exclu** des rappels
- ❌ `interrompue` → **Exclu** des rappels

---

### **Étape 2 : Récupérer les CPN de chaque grossesse**

```javascript
for (const grossesseDoc of grossessesSnapshot.docs) {
    const grossesseId = grossesseDoc.id;
    
    // Récupérer toutes les CPN de cette grossesse
    const cpnsQuery = query(
        collection(db, 'cpns'),
        where('grossesseId', '==', grossesseId)
    );
}
```

---

### **Étape 3 : Collecter toutes les consultations avec RDV**

```javascript
const consultationsWithRdv = [];

for (const cpnDoc of cpnsSnapshot.docs) {
    const cpnData = cpnDoc.data();
    const consultationId = cpnData.consultationId;
    
    // Récupérer la consultation associée
    const consultation = await getConsultation(consultationId);
    
    // Vérifier que la consultation a un RDV non vide
    if (!consultation.rdv || consultation.rdv === '') continue;
    
    // Ajouter à la liste temporaire avec la date de création
    consultationsWithRdv.push({
        cpnDoc,
        cpnData,
        consultationId,
        consultation,
        createdAt: consultation.createdAt || consultation.dateConsultation
    });
}
```

---

### **Étape 4 : Sélectionner la dernière consultation (la plus récente)**

```javascript
// Si aucune consultation avec RDV, passer à la grossesse suivante
if (consultationsWithRdv.length === 0) continue;

// Trier par date de création (la plus récente en premier)
consultationsWithRdv.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime(); // Décroissant
});

// Prendre uniquement la première (la plus récente)
const lastConsultation = consultationsWithRdv[0];
```

**Pourquoi ?**
- ✅ Une grossesse peut avoir plusieurs CPN avec RDV
- ✅ Seul le RDV le plus récent est pertinent pour les rappels
- ✅ Évite les rappels multiples pour la même grossesse
- ✅ Reflète la situation actuelle de la patiente

---

### **Étape 5 : Calculer la différence en jours**

```javascript
// Convertir la date RDV (support string et Timestamp)
let rdv;
if (consultation.rdv.toDate) {
    rdv = consultation.rdv.toDate();  // Timestamp Firestore
} else if (typeof consultation.rdv === 'string') {
    rdv = new Date(consultation.rdv);  // String YYYY-MM-DD
}

// Calculer les jours jusqu'au RDV
const diffDays = Math.ceil((rdv - today) / (1000 * 60 * 60 * 24));
```

**Exemples** :
- `diffDays = 3` → RDV dans 3 jours
- `diffDays = 0` → RDV aujourd'hui
- `diffDays = -5` → RDV en retard de 5 jours

---

### **Étape 5 : Récupérer les informations patiente**

```javascript
// Chaîne de relations
grossesse → dossier → patiente → personne

// Récupérer nom, prénom, téléphone, email
const patient = {
    patientId,
    nom: personne.nom || patient.nom,
    prenom: personne.prenom || patient.prenom,
    telephone: personne.telephone || patient.telephone,
    email: personne.email || patient.email
};
```

---

## 📊 Structure de données retournée

```javascript
{
    id: "consultationId",
    cpnId: "cpnId",
    cpnLabel: "CPN 1",
    rdv: Timestamp | String,
    diffDays: 3,
    userId: "sageFemmeId",
    grossesseId: "grossesseId",
    patient: {
        patientId: "patientId",
        nom: "Doe",
        prenom: "Jane",
        telephone: "97123456",
        email: "jane@example.com"
    }
}
```

---

## 🎯 Conditions d'envoi des rappels

### **Rappels envoyés si** :

```javascript
if (diffDays === 3 || diffDays === 1 || diffDays === 0 || diffDays < 0) {
    await sendReminders(cpn, diffDays);
}
```

| Condition | Description | Message |
|-----------|-------------|---------|
| `diffDays === 3` | J-3 | "Votre CPN est dans 3 jours" |
| `diffDays === 1` | J-1 | "Votre CPN est demain" |
| `diffDays === 0` | J-0 | "Votre CPN est aujourd'hui" |
| `diffDays < 0` | Retard | "Votre CPN est en retard" |

### **Rappels NON envoyés si** :

- `diffDays > 3` → RDV trop loin (pas encore de rappel)
- Grossesse terminée → **Exclu dès le départ**
- Pas de RDV → **Ignoré**
- Date RDV invalide → **Ignoré**

---

## 🔍 Logs de débogage

Le système affiche des logs détaillés :

```
🔍 Récupération des CPN pour grossesses en cours...
📋 5 grossesses en cours trouvées
✅ CPN ajoutée: Jane Doe - RDV dans 3 jours
✅ CPN ajoutée: Marie Martin - RDV dans 1 jour
⚠️ Date RDV invalide pour consultation ABC123
❌ Erreur traitement grossesse GS123: ...
📊 Total: 8 CPN avec RDV trouvées
```

---

## ✅ Avantages de cette approche

### **1. Performance optimisée**
- ✅ Filtre dès le départ sur `statut = 'en_cours'`
- ✅ Pas de traitement inutile des grossesses terminées
- ✅ Moins de requêtes Firestore

### **2. Logique métier correcte**
- ✅ Pas de rappels pour grossesses terminées
- ✅ Pas de rappels pour accouchements déjà effectués
- ✅ Focus sur les patientes actives

### **3. Données fiables**
- ✅ Support des deux formats de date (Timestamp et String)
- ✅ Validation stricte des dates
- ✅ Gestion d'erreurs robuste

### **4. Traçabilité**
- ✅ Logs détaillés pour chaque étape
- ✅ Compteurs de CPN trouvées
- ✅ Messages d'erreur explicites

---

## 🔄 Comparaison avec l'ancienne logique

### **Ancienne approche** ❌

```
consultations (toutes) → cpns → grossesses (toutes) → patientes
```

**Problèmes** :
- ❌ Traite les grossesses terminées
- ❌ Peut envoyer des rappels pour accouchements déjà effectués
- ❌ Moins performant (plus de requêtes)

### **Nouvelle approche** ✅

```
grossesses (en_cours uniquement) → cpns → consultations → patientes
```

**Avantages** :
- ✅ Filtre dès le départ
- ✅ Logique métier correcte
- ✅ Plus performant
- ✅ Pas de rappels inutiles

---

## 📝 Exemple concret

### **Scénario : 3 grossesses dans la base**

#### **Grossesse 1 : Marie (en_cours)**
```json
{
    "id": "GS001",
    "statut": "en_cours",
    "cpns": [
        {
            "cpn": "CPN 1",
            "consultationId": "C001",
            "rdv": "2025-11-15"  // Dans 3 jours
        }
    ]
}
```
**Résultat** : ✅ Rappel envoyé (J-3)

#### **Grossesse 2 : Sophie (terminée)**
```json
{
    "id": "GS002",
    "statut": "terminée",
    "cpns": [
        {
            "cpn": "CPN 4",
            "consultationId": "C002",
            "rdv": "2025-11-20"
        }
    ]
}
```
**Résultat** : ❌ **Ignorée** (grossesse terminée)

#### **Grossesse 3 : Julie (en_cours)**
```json
{
    "id": "GS003",
    "statut": "en_cours",
    "cpns": [
        {
            "cpn": "CPN 2",
            "consultationId": "C003",
            "rdv": ""  // Pas de RDV
        }
    ]
}
```
**Résultat** : ❌ **Ignorée** (pas de RDV)

---

## 🧪 Tests

### **Test 1 : Grossesse en cours avec RDV**

```javascript
// Créer une grossesse en cours
await addDoc(collection(db, 'grossesses'), {
    statut: 'en_cours',
    dossierId: 'D001',
    // ...
});

// Créer une CPN avec RDV dans 3 jours
await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS001',
    consultationId: 'C001',
    // ...
});

await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-11-15',  // Dans 3 jours
    // ...
});

// Exécuter les rappels
await cronService.runRemindersNow();

// Résultat attendu : ✅ Rappel envoyé
```

### **Test 2 : Grossesse terminée**

```javascript
// Créer une grossesse terminée
await addDoc(collection(db, 'grossesses'), {
    statut: 'terminée',
    dossierId: 'D002',
    // ...
});

// Créer une CPN avec RDV
await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS002',
    consultationId: 'C002',
    // ...
});

await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-11-15',
    // ...
});

// Exécuter les rappels
await cronService.runRemindersNow();

// Résultat attendu : ❌ Aucun rappel (grossesse terminée)
```

---

## 🔐 Sécurité et validation

### **Validations effectuées**

1. ✅ Statut grossesse = `'en_cours'`
2. ✅ CPN a un `consultationId`
3. ✅ Consultation existe
4. ✅ Consultation a un RDV non vide
5. ✅ Date RDV est valide
6. ✅ Patiente existe
7. ✅ Téléphone ou email disponible

### **Gestion d'erreurs**

```javascript
try {
    // Traitement de la grossesse
} catch (error) {
    console.error(`❌ Erreur traitement grossesse ${grossesseId}:`, error);
    // Continue avec la grossesse suivante
}
```

---

## 📊 Statistiques

Le système affiche :
- Nombre de grossesses en cours
- Nombre de CPN avec RDV trouvées
- Nombre de rappels envoyés
- Erreurs rencontrées

```
🔍 Récupération des CPN pour grossesses en cours...
📋 12 grossesses en cours trouvées
✅ CPN ajoutée: Marie Dupont - RDV dans 3 jours
✅ CPN ajoutée: Sophie Martin - RDV dans 1 jour
✅ CPN ajoutée: Julie Bernard - RDV dans 0 jour
📊 Total: 8 CPN avec RDV trouvées
🔄 Traitement des rappels CPN...
✅ 3 rappels envoyés
```

---

## 🎯 Résumé

**Nouvelle logique** :
1. ✅ Filtre sur `statut = 'en_cours'` dès le départ
2. ✅ Récupère les CPN de ces grossesses
3. ✅ Vérifie les consultations avec RDV
4. ✅ Envoie les rappels si J-3, J-1, J-0 ou retard
5. ✅ Ignore complètement les grossesses terminées

**Résultat** : Rappels pertinents uniquement pour les patientes actives ! 🎉
