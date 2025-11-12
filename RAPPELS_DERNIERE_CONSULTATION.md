# 🎯 Rappels CPN - Dernière Consultation Uniquement

## 📋 Règle principale

**Pour chaque grossesse en cours, seule la DERNIÈRE consultation avec RDV (la plus récente) est prise en compte pour les rappels.**

---

## 🔄 Flux simplifié

```
1. Grossesses en cours (statut = 'en_cours')
   ↓
2. CPN de chaque grossesse
   ↓
3. Consultations avec RDV de chaque CPN
   ↓
4. TRI par date (plus récente en premier) ⭐
   ↓
5. Sélection de la PREMIÈRE (= dernière consultation) ⭐
   ↓
6. Calcul différence en jours
   ↓
7. Envoi rappel si J-3, J-1, J-0 ou retard
```

---

## 💡 Exemple concret

### **Scénario : Grossesse de Marie**

Marie a une grossesse en cours avec **3 CPN effectuées** :

| CPN | Date consultation | RDV planifié | Statut CPN |
|-----|-------------------|--------------|------------|
| CPN 1 | 01/09/2025 | 15/10/2025 | Terminé |
| CPN 2 | 10/10/2025 | 10/11/2025 | Terminé |
| CPN 3 | 05/11/2025 | **15/11/2025** | Terminé |

### **Traitement par le système**

1. ✅ Grossesse de Marie = `en_cours`
2. ✅ Récupération des 3 CPN
3. ✅ Récupération des 3 consultations avec RDV :
   - Consultation 1 : RDV 15/10/2025 (créée le 01/09)
   - Consultation 2 : RDV 10/11/2025 (créée le 10/10)
   - Consultation 3 : RDV **15/11/2025** (créée le 05/11) ⭐

4. ✅ **Tri par date de création** :
   ```
   [
     { rdv: '15/11/2025', createdAt: '05/11/2025' },  // ⭐ Plus récente
     { rdv: '10/11/2025', createdAt: '10/10/2025' },
     { rdv: '15/10/2025', createdAt: '01/09/2025' }
   ]
   ```

5. ✅ **Sélection de la première** (index 0) :
   - RDV retenu : **15/11/2025**
   - Les autres RDV (15/10 et 10/11) sont **ignorés**

6. ✅ **Calcul** (aujourd'hui = 12/11/2025) :
   - Différence : 15/11 - 12/11 = **3 jours**
   - Statut : **J-3** → Rappel envoyé ✅

### **Résultat**

- ✅ **1 seul rappel** envoyé pour Marie (RDV du 15/11)
- ❌ **Pas de rappel** pour les anciens RDV (15/10 et 10/11)

---

## ❌ Ce qui est IGNORÉ

### **1. Anciennes consultations avec RDV**

Si une grossesse a plusieurs consultations avec RDV, seule la plus récente compte.

**Exemple** :
```
Grossesse GS001:
  - CPN 1: RDV 01/10/2025 ❌ Ignoré (ancien)
  - CPN 2: RDV 15/10/2025 ❌ Ignoré (ancien)
  - CPN 3: RDV 20/11/2025 ✅ Pris en compte (le plus récent)
```

### **2. Grossesses terminées**

Toutes les consultations des grossesses terminées sont ignorées, même si elles ont un RDV.

**Exemple** :
```
Grossesse GS002 (statut = 'terminée'):
  - CPN 4: RDV 25/11/2025 ❌ Ignoré (grossesse terminée)
```

### **3. Consultations sans RDV**

Les consultations sans RDV ou avec RDV vide sont ignorées.

**Exemple** :
```
Grossesse GS003:
  - CPN 1: RDV = '' ❌ Ignoré (pas de RDV)
  - CPN 2: RDV = null ❌ Ignoré (pas de RDV)
  - CPN 3: RDV = '30/11/2025' ✅ Pris en compte
```

---

## ✅ Avantages de cette approche

### **1. Évite les rappels multiples**

Sans cette logique :
```
❌ Marie reçoit 3 rappels :
  - "Votre CPN du 15/10 est en retard"
  - "Votre CPN du 10/11 est en retard"
  - "Votre CPN du 15/11 est dans 3 jours"
```

Avec cette logique :
```
✅ Marie reçoit 1 seul rappel :
  - "Votre CPN du 15/11 est dans 3 jours"
```

### **2. Reflète la situation actuelle**

- ✅ Seul le prochain RDV est pertinent
- ✅ Les anciens RDV sont déjà passés ou gérés
- ✅ Pas de confusion pour la patiente

### **3. Optimise les ressources**

- ✅ Moins de SMS envoyés (économies)
- ✅ Moins de notifications in-app
- ✅ Moins de charge sur le système

### **4. Logique métier correcte**

- ✅ Une grossesse = 1 prochain RDV
- ✅ Pas de rappels pour RDV déjà passés
- ✅ Focus sur l'action à venir

---

## 🔍 Logs de débogage

Le système affiche des logs pour chaque grossesse :

```
🔍 Récupération des CPN pour grossesses en cours...
📋 5 grossesses en cours trouvées

Grossesse GS001:
  - 3 consultations avec RDV trouvées
  - Tri par date...
  - 📌 Dernière consultation avec RDV = C003
  - RDV: 15/11/2025
  - ✅ CPN ajoutée: Marie Dupont - RDV dans 3 jours

Grossesse GS002:
  - 2 consultations avec RDV trouvées
  - Tri par date...
  - 📌 Dernière consultation avec RDV = C005
  - RDV: 20/11/2025
  - ✅ CPN ajoutée: Sophie Martin - RDV dans 8 jours

📊 Total: 2 CPN avec RDV trouvées (1 par grossesse)
```

---

## 🧪 Tests

### **Test 1 : Grossesse avec plusieurs RDV**

```javascript
// Créer une grossesse en cours
await addDoc(collection(db, 'grossesses'), {
    statut: 'en_cours',
    dossierId: 'D001'
});

// Créer 3 CPN avec RDV
await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS001',
    consultationId: 'C001'
});
await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-10-15',
    createdAt: Timestamp.fromDate(new Date('2025-09-01'))
});

await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS001',
    consultationId: 'C002'
});
await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-11-10',
    createdAt: Timestamp.fromDate(new Date('2025-10-10'))
});

await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS001',
    consultationId: 'C003'
});
await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-11-15',  // ⭐ Le plus récent
    createdAt: Timestamp.fromDate(new Date('2025-11-05'))
});

// Exécuter les rappels
await cronService.runRemindersNow();

// Résultat attendu :
// ✅ 1 seul rappel pour le RDV du 15/11
// ❌ Pas de rappel pour les RDV du 15/10 et 10/11
```

### **Test 2 : Grossesse avec 1 seul RDV**

```javascript
// Créer une grossesse en cours
await addDoc(collection(db, 'grossesses'), {
    statut: 'en_cours',
    dossierId: 'D002'
});

// Créer 1 CPN avec RDV
await addDoc(collection(db, 'cpns'), {
    grossesseId: 'GS002',
    consultationId: 'C004'
});
await addDoc(collection(db, 'consultations'), {
    type: 'CPN',
    rdv: '2025-11-20',
    createdAt: Timestamp.now()
});

// Exécuter les rappels
await cronService.runRemindersNow();

// Résultat attendu :
// ✅ 1 rappel pour le RDV du 20/11
```

---

## 📊 Statistiques

Le système compte **1 CPN par grossesse en cours** (la dernière avec RDV) :

```
Statistiques :
- Grossesses en cours : 10
- Grossesses avec RDV : 8
- CPN avec RDV trouvées : 8 (1 par grossesse)
- Rappels envoyés : 3 (J-3, J-1, J-0 ou retard)
```

---

## 🎯 Résumé

| Aspect | Comportement |
|--------|--------------|
| **Grossesses en cours** | ✅ Traitées |
| **Grossesses terminées** | ❌ Ignorées |
| **Consultations par grossesse** | ✅ Dernière uniquement |
| **Anciennes consultations** | ❌ Ignorées |
| **Consultations sans RDV** | ❌ Ignorées |
| **Rappels par grossesse** | ✅ Maximum 1 |

**Règle d'or** : **1 grossesse en cours = 1 rappel maximum (pour le dernier RDV)**

---

## 🔧 Code clé

```javascript
// Trier par date de création (décroissant)
consultationsWithRdv.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime(); // Plus récent en premier
});

// Prendre uniquement la première (= la plus récente)
const lastConsultation = consultationsWithRdv[0];
```

**Résultat** : Rappels pertinents, pas de spam, logique métier correcte ! 🎉
