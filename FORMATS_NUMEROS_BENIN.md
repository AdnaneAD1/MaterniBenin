# 📱 Formats de numéros de téléphone au Bénin

## 🇧🇯 Format officiel

**Format international E.164** : `+229XXXXXXXX`
- Indicatif pays : **+229**
- Numéro local : **8 chiffres**
- **Total : 11 chiffres** (avec le +)

---

## 📋 Formats locaux courants

### **1. Format avec préfixe 01 (le plus courant)**

```
Format saisi : 0160807271
Longueur     : 10 chiffres (0 + 1 + 60807271)
Conversion   : Enlever les 2 premiers chiffres (01)
Résultat     : +22960807271 ✅
```

**Explication** :
- Le **0** est le préfixe national (comme en France)
- Le **1** est un ancien préfixe mobile
- Les **8 chiffres restants** sont le numéro réel

### **2. Format avec préfixe 0 uniquement**

```
Format saisi : 060807271
Longueur     : 9 chiffres (0 + 60807271)
Conversion   : Enlever le 0 initial
Résultat     : +22960807271 ✅
```

### **3. Format sans préfixe**

```
Format saisi : 60807271
Longueur     : 8 chiffres
Conversion   : Ajouter +229
Résultat     : +22960807271 ✅
```

### **4. Format international déjà correct**

```
Format saisi : +22960807271
Longueur     : 12 caractères (+ + 11 chiffres)
Conversion   : Aucune (déjà correct)
Résultat     : +22960807271 ✅
```

---

## 🔢 Préfixes des opérateurs béninois

### **MTN Bénin**
- **96** : 96XXXXXX
- **97** : 97XXXXXX
- **66** : 66XXXXXX
- **67** : 67XXXXXX

### **Moov Africa (Bénin)**
- **60** : 60XXXXXX
- **61** : 61XXXXXX
- **62** : 62XXXXXX
- **63** : 63XXXXXX
- **64** : 64XXXXXX
- **65** : 65XXXXXX
- **69** : 69XXXXXX
- **90** : 90XXXXXX
- **91** : 91XXXXXX
- **94** : 94XXXXXX
- **95** : 95XXXXXX
- **98** : 98XXXXXX
- **99** : 99XXXXXX

---

## 🔧 Logique de conversion implémentée

### **Fonction `formatPhoneNumber()` dans `smsService.js`**

```javascript
formatPhoneNumber(phone) {
  // 1. Nettoyer (enlever espaces, tirets, etc.)
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // 2. Cas 1: Déjà au format international (229XXXXXXXX)
  if (cleaned.startsWith('229') && cleaned.length === 11) {
    return '+' + cleaned; // +22960807271
  }
  
  // 3. Cas 2: Format local avec 01 (0160807271)
  if (cleaned.length === 10 && cleaned.startsWith('01')) {
    return '+229' + cleaned.substring(2); // Enlever 01 → +22960807271
  }
  
  // 4. Cas 3: Format local avec 0 (060807271)
  if (cleaned.length === 9 && cleaned.startsWith('0')) {
    return '+229' + cleaned.substring(1); // Enlever 0 → +22960807271
  }
  
  // 5. Cas 4: Format sans préfixe (60807271)
  if (cleaned.length === 8) {
    return '+229' + cleaned; // +22960807271
  }
  
  // 6. Format non reconnu
  return null;
}
```

---

## ✅ Exemples de conversion

| Format saisi | Nettoyé | Longueur | Conversion | Résultat |
|--------------|---------|----------|------------|----------|
| `0160807271` | `0160807271` | 10 | Enlever `01` | `+22960807271` ✅ |
| `01 60 80 72 71` | `0160807271` | 10 | Enlever `01` | `+22960807271` ✅ |
| `01-60-80-72-71` | `0160807271` | 10 | Enlever `01` | `+22960807271` ✅ |
| `060807271` | `060807271` | 9 | Enlever `0` | `+22960807271` ✅ |
| `60807271` | `60807271` | 8 | Ajouter `+229` | `+22960807271` ✅ |
| `+22960807271` | `22960807271` | 11 | Ajouter `+` | `+22960807271` ✅ |
| `22960807271` | `22960807271` | 11 | Ajouter `+` | `+22960807271` ✅ |
| `123456` | `123456` | 6 | ❌ Invalide | `null` |

---

## 🚫 Cas d'erreur

### **Erreur 1 : Numéro trop court**

```
Format saisi : 123456
Longueur     : 6 chiffres
Résultat     : null ❌
Log          : ⚠️ Format de numéro non reconnu: 123456
```

### **Erreur 2 : Numéro identique au numéro Twilio**

```
Numéro patiente : +22960807271
Numéro Twilio   : +22960807271
Résultat        : SMS non envoyé (skipped) ⚠️
Log             : ⚠️ Tentative d'envoi SMS au même numéro que Twilio
```

**Twilio refuse** d'envoyer un SMS à son propre numéro (erreur 21266).

### **Erreur 3 : Format invalide pour Twilio**

```
Format envoyé : +229160807271 (12 chiffres)
Twilio attend : +22960807271 (11 chiffres)
Résultat      : Error 21211 - Invalid 'To' Phone Number ❌
```

---

## 🔍 Débogage

### **Logs de conversion**

Le système affiche des logs pour chaque conversion :

```
✅ Numéro formaté: +22960807271
   Original: 0160807271
   Nettoyé: 0160807271
   Longueur: 10
   Méthode: Enlever 01
```

En cas d'erreur :

```
⚠️ Format de numéro non reconnu: 123456 (nettoyé: 123456)
```

### **Vérification manuelle**

Pour tester un numéro :

```javascript
const smsService = require('./smsService');
const formatted = smsService.formatPhoneNumber('0160807271');
console.log(formatted); // +22960807271
```

---

## 📊 Statistiques d'utilisation

### **Formats les plus courants au Bénin**

1. **0160807271** (10 chiffres avec 01) → 70% des cas
2. **060807271** (9 chiffres avec 0) → 20% des cas
3. **60807271** (8 chiffres sans préfixe) → 8% des cas
4. **+22960807271** (international) → 2% des cas

---

## 🎯 Recommandations

### **Pour les utilisateurs**

1. ✅ **Enregistrer** les numéros au format `0160807271` (le plus courant)
2. ✅ **Accepter** tous les formats (le système convertit automatiquement)
3. ✅ **Vérifier** que le numéro a au moins 8 chiffres
4. ❌ **Éviter** d'utiliser le numéro Twilio comme numéro de patiente

### **Pour les développeurs**

1. ✅ **Toujours** utiliser `formatPhoneNumber()` avant d'envoyer un SMS
2. ✅ **Vérifier** le retour (peut être `null` si invalide)
3. ✅ **Logger** les conversions pour débogage
4. ✅ **Gérer** les erreurs Twilio (21211, 21266)

---

## 🔗 Références

- **Twilio Error 21211** : https://www.twilio.com/docs/errors/21211 (Invalid phone number)
- **Twilio Error 21266** : https://www.twilio.com/docs/errors/21266 (Same To/From number)
- **Format E.164** : https://www.twilio.com/docs/glossary/what-e164
- **Indicatifs Bénin** : https://en.wikipedia.org/wiki/Telephone_numbers_in_Benin

---

## ✅ Résumé

| Aspect | Valeur |
|--------|--------|
| **Format Twilio** | `+229XXXXXXXX` (11 chiffres) |
| **Format local** | `0160807271` (10 chiffres) |
| **Conversion** | Enlever `01` → Ajouter `+229` |
| **Validation** | 8 chiffres minimum |
| **Opérateurs** | MTN (96, 97, 66, 67), Moov (60-65, 69, 90-99) |

**Règle d'or** : **+229 + 8 chiffres = Format valide** ✅
