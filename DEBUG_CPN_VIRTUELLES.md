# 🐛 Guide de débogage : CPN Virtuelles

Ce guide vous aide à diagnostiquer pourquoi les CPN virtuelles ne sont pas créées.

---

## 🔍 Étape 1 : Vérifier les logs de la console

Ouvrez la console du navigateur (F12) et rechargez la page CPN. Vous devriez voir :

### Logs attendus

```
=== Traitement consultation ABC123 ===
rdvDate: 2024-12-15 Type: string
patientInfo: OK
✅ Date RDV valide: Mon Dec 15 2024 00:00:00 GMT+0100
Date aujourd'hui: Tue Nov 12 2024 00:00:00 GMT+0100
Différence en jours: 33
Statut: Planifié (RDV dans 33 jours)
✅ CPN fictive créée avec statut: Planifié
```

### Problèmes possibles

#### ❌ Problème 1 : `rdvDate: '' Type: string`

**Cause** : Le champ `rdv` est vide dans la base de données

**Solution** :
1. Ouvrez Firebase Console
2. Allez dans **Firestore Database**
3. Collection `consultations` → Sélectionnez une consultation
4. Vérifiez que le champ `rdv` contient une date (ex: `2024-12-15`)
5. Si vide, modifiez-le manuellement ou créez une nouvelle consultation

#### ❌ Problème 2 : `patientInfo: NULL`

**Cause** : Impossible de récupérer les informations de la patiente

**Solution** :
1. Vérifiez que la consultation a un champ `grossesseId` ou `userId`
2. Vérifiez que la grossesse existe dans la collection `grossesses`
3. Vérifiez la chaîne : `grossesses` → `dossiers` → `patientes` → `personnes`

#### ❌ Problème 3 : `❌ Date RDV invalide, skip`

**Cause** : Le format de la date est incorrect

**Solution** :
1. Le format attendu est `YYYY-MM-DD` (ex: `2024-12-15`)
2. Vérifiez dans Firebase que la date est bien au format ISO
3. Évitez les formats `DD/MM/YYYY` ou `MM/DD/YYYY`

#### ❌ Problème 4 : `⚠️ Condition non remplie`

**Cause** : `rdvDate` est vide ou `patientInfo` est null

**Solution** : Voir problèmes 1 et 2 ci-dessus

---

## 🔍 Étape 2 : Vérifier la base de données

### Collection `consultations`

Ouvrez Firebase Console et vérifiez qu'une consultation CPN contient :

```json
{
  "type": "CPN",
  "dateConsultation": Timestamp,
  "diagnostique": "Consultation normale",
  "rdv": "2024-12-15",  // ✅ Format YYYY-MM-DD
  "userId": "ABC123",
  "createdAt": Timestamp
}
```

**Points à vérifier** :
- ✅ `type` = `"CPN"` (exactement)
- ✅ `rdv` n'est pas vide
- ✅ `rdv` est au format `YYYY-MM-DD`
- ✅ `userId` existe

### Collection `cpns`

Vérifiez qu'il existe une CPN terminée liée à cette consultation :

```json
{
  "cpn": "CPN 1",
  "consultationId": "ABC123",  // ✅ Lien vers la consultation
  "grossesseId": "DEF456",
  "dormirsurmild": true,
  // ... autres champs
}
```

**Important** : Si une CPN terminée existe avec le même `consultationId`, la CPN virtuelle ne sera **pas** créée (c'est normal).

---

## 🔍 Étape 3 : Tester manuellement

### Test 1 : Créer une consultation avec RDV

1. Allez sur la page d'une grossesse
2. Cliquez sur **"Ajouter CPN"**
3. Remplissez le formulaire
4. **Important** : Remplissez le champ **"Prochain RDV"** avec une date future (ex: dans 10 jours)
5. Enregistrez
6. Rechargez la page CPN
7. Vérifiez les logs de la console

### Test 2 : Vérifier les dates calculées

Ouvrez la console et tapez :

```javascript
// Date d'aujourd'hui
const today = new Date();
console.log('Aujourd\'hui:', today);

// Date RDV (exemple : dans 10 jours)
const rdv = new Date('2024-11-22');
console.log('RDV:', rdv);

// Différence en jours
const diffDays = Math.floor((rdv - today) / (1000 * 60 * 60 * 24));
console.log('Différence:', diffDays, 'jours');

// Statut attendu
if (diffDays < -7) console.log('Statut: En retard');
else if (diffDays >= -7 && diffDays <= 7) console.log('Statut: En attente');
else if (diffDays > 7) console.log('Statut: Planifié');
```

---

## 🔍 Étape 4 : Vérifier le code

### Fichier : `/src/hooks/patientes.js`

Ligne ~655-736 : Fonction de création des CPN virtuelles

**Points de vérification** :

1. ✅ La condition `if (rdvDate && rdvDate !== '' && patientInfo)` est bien présente
2. ✅ Le try-catch entoure le code de conversion de date
3. ✅ La vérification `isNaN(rdv.getTime())` est présente
4. ✅ Les 3 conditions de statut sont présentes (< -7, -7 à 7, > 7)
5. ✅ `shouldCreateVirtualCpn = true` est défini dans chaque condition

### Fichier : `/src/app/dashboard/cpn/page.js`

Ligne ~42-68 : Transformation des données CPN

**Points de vérification** :

1. ✅ Le champ `isVirtual` est bien mappé
2. ✅ Le champ `rdv` est bien mappé
3. ✅ Le champ `status` est bien mappé

---

## 🔍 Étape 5 : Cas particuliers

### Cas 1 : Consultations sans grossesse

Si une consultation n'a pas de `grossesseId`, le système essaie de :
1. Trouver une CPN existante avec le même `userId`
2. Récupérer le `grossesseId` de cette CPN
3. Si échec, chercher une grossesse active
4. Si échec, créer une patiente virtuelle

**Solution** : Assurez-vous que chaque consultation est liée à une grossesse.

### Cas 2 : Plusieurs consultations pour la même patiente

C'est normal ! Le système crée une CPN virtuelle pour **chaque** consultation qui a un RDV.

### Cas 3 : CPN virtuelle disparaît après création d'une CPN réelle

C'est normal ! Quand vous créez une CPN réelle (terminée), la CPN virtuelle associée n'est plus créée.

---

## 🔍 Étape 6 : Checklist complète

- [ ] Les logs de la console s'affichent
- [ ] `rdvDate` n'est pas vide
- [ ] `rdvDate` est au format `YYYY-MM-DD`
- [ ] `patientInfo` n'est pas null
- [ ] La date RDV est valide (pas `Invalid Date`)
- [ ] La différence en jours est calculée correctement
- [ ] Le statut est déterminé (Planifié/En attente/En retard)
- [ ] `shouldCreateVirtualCpn = true`
- [ ] La CPN virtuelle est ajoutée au tableau
- [ ] Le log "✅ CPN fictive créée" s'affiche

---

## 🐛 Problèmes fréquents et solutions

### Problème : Aucune CPN virtuelle n'apparaît

**Solutions** :
1. Vérifiez qu'il existe des consultations CPN avec un champ `rdv` rempli
2. Vérifiez que le champ `rdv` n'est pas une string vide `''`
3. Vérifiez que la date est au format `YYYY-MM-DD`
4. Rechargez la page (Ctrl+R ou Cmd+R)

### Problème : Seulement les CPN "En retard" apparaissent

**Cause** : Les dates RDV sont toutes dans le passé

**Solution** : Créez des consultations avec des dates RDV futures (dans 10-30 jours)

### Problème : Les CPN virtuelles ont une date incorrecte

**Cause** : Le champ `rdv` est affiché au lieu de `dateConsultation` pour les CPN terminées

**Solution** : Vérifiez que le code affiche :
- CPN terminées → `dateConsultation`
- CPN virtuelles → `rdv`

### Problème : Erreur "Cannot read property 'toDate' of undefined"

**Cause** : Le champ `rdv` n'existe pas dans la consultation

**Solution** : Ajoutez le champ `rdv` manuellement dans Firebase ou créez une nouvelle consultation

---

## 📊 Exemple de données de test

### Consultation avec RDV dans 15 jours (Planifié)

```json
{
  "type": "CPN",
  "dateConsultation": "2024-11-12T08:00:00Z",
  "diagnostique": "RAS",
  "rdv": "2024-11-27",
  "userId": "USER123",
  "createdAt": "2024-11-12T08:00:00Z"
}
```

**Résultat attendu** : CPN virtuelle avec statut "Planifié"

### Consultation avec RDV dans 3 jours (En attente)

```json
{
  "type": "CPN",
  "dateConsultation": "2024-11-09T08:00:00Z",
  "diagnostique": "RAS",
  "rdv": "2024-11-15",
  "userId": "USER123",
  "createdAt": "2024-11-09T08:00:00Z"
}
```

**Résultat attendu** : CPN virtuelle avec statut "En attente"

### Consultation avec RDV dépassé de 10 jours (En retard)

```json
{
  "type": "CPN",
  "dateConsultation": "2024-10-25T08:00:00Z",
  "diagnostique": "RAS",
  "rdv": "2024-11-02",
  "userId": "USER123",
  "createdAt": "2024-10-25T08:00:00Z"
}
```

**Résultat attendu** : CPN virtuelle avec statut "En retard"

---

## 🎯 Résumé rapide

Pour que les CPN virtuelles fonctionnent :

1. ✅ Consultations CPN avec `type: "CPN"`
2. ✅ Champ `rdv` rempli au format `YYYY-MM-DD`
3. ✅ Consultation liée à une grossesse (via `grossesseId` ou `userId`)
4. ✅ Pas de CPN terminée avec le même `consultationId`
5. ✅ Logs de la console activés pour le débogage

---

## 📞 Besoin d'aide ?

Si le problème persiste :

1. Copiez les logs de la console
2. Vérifiez les données dans Firebase
3. Testez avec une nouvelle consultation
4. Vérifiez que le code est à jour
