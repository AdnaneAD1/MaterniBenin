# 📱 Tests de formatage des numéros SMS

## Fonction de formatage améliorée

La fonction `formatPhoneNumber()` dans `smsService.js` gère maintenant tous les formats béninois.

## Formats acceptés

| Format d'entrée | Format de sortie | Description |
|----------------|------------------|-------------|
| `0160807271` | `+22960807271` | Format local avec 0 (le plus courant) |
| `60807271` | `+22960807271` | Format local sans 0 (cas rare) |
| `+22960807271` | `+22960807271` | Déjà au format international |
| `22960807271` | `+22960807271` | Indicatif sans + |
| `01 60 80 72 71` | `+22960807271` | Avec espaces |
| `01-60-80-72-71` | `+22960807271` | Avec tirets |

## Cas gérés

### ✅ Cas valides

```javascript
// Format local avec 0 (9 chiffres)
formatPhoneNumber('0160807271') → '+22960807271'
formatPhoneNumber('0197654321') → '+22997654321'

// Format local sans 0 (8 chiffres)
formatPhoneNumber('60807271') → '+22960807271'
formatPhoneNumber('97654321') → '+22997654321'

// Déjà au format international
formatPhoneNumber('+22960807271') → '+22960807271'
formatPhoneNumber('22960807271') → '+22960807271'

// Avec caractères spéciaux (nettoyés automatiquement)
formatPhoneNumber('01 60 80 72 71') → '+22960807271'
formatPhoneNumber('01-60-80-72-71') → '+22960807271'
formatPhoneNumber('(01) 60 80 72 71') → '+22960807271'
```

### ❌ Cas invalides (retourne null + warning)

```javascript
// Trop court
formatPhoneNumber('123456') → null

// Trop long
formatPhoneNumber('012345678901') → null

// Vide ou null
formatPhoneNumber('') → null
formatPhoneNumber(null) → null

// Format incorrect
formatPhoneNumber('abc123') → null (après nettoyage: '123')
```

## 🧪 Comment tester

### Test manuel dans la console

1. Ouvrir la console du navigateur
2. Copier-coller ce code :

```javascript
// Importer le service (si en développement)
import smsService from '@/services/smsService';

// Tester différents formats
const testNumbers = [
  '0160807271',
  '60807271',
  '+22960807271',
  '01 60 80 72 71',
  '01-60-80-72-71',
  '123456', // invalide
];

testNumbers.forEach(num => {
  const formatted = smsService.formatPhoneNumber(num);
  console.log(`${num} → ${formatted}`);
});
```

### Test via API

Créez un endpoint de test temporaire :

**Fichier** : `src/app/api/test-sms-format/route.js`

```javascript
import { NextResponse } from 'next/server';
import smsService from '@/services/smsService';

export async function POST(request) {
  const { phone } = await request.json();
  
  const formatted = smsService.formatPhoneNumber(phone);
  
  return NextResponse.json({
    input: phone,
    output: formatted,
    valid: formatted !== null
  });
}
```

Puis tester avec curl :

```bash
curl -X POST http://localhost:3000/api/test-sms-format \
  -H "Content-Type: application/json" \
  -d '{"phone": "0160807271"}'

# Réponse attendue:
# {"input":"0160807271","output":"+22960807271","valid":true}
```

### Test avec plusieurs numéros

```bash
# Créer un fichier test-numbers.json
echo '[
  "0160807271",
  "60807271",
  "+22960807271",
  "01 60 80 72 71",
  "123456"
]' > test-numbers.json

# Tester chaque numéro
for num in $(cat test-numbers.json | jq -r '.[]'); do
  curl -X POST http://localhost:3000/api/test-sms-format \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"$num\"}"
  echo ""
done
```

## 🔍 Vérification dans les logs

Lors de l'envoi de SMS, les logs afficheront :

```
✅ SMS envoyé: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Numéro formaté: +22960807271
```

En cas d'erreur de format :

```
⚠️ Format de numéro non reconnu: 123456 (nettoyé: 123456)
❌ Erreur envoi SMS: Numéro de téléphone invalide
```

## 📊 Validation Twilio

Twilio accepte les formats suivants :
- ✅ `+22960807271` (E.164 format - recommandé)
- ✅ `22960807271` (sans +, mais moins recommandé)
- ❌ `0160807271` (format local non accepté)
- ❌ `60807271` (trop court)

Notre fonction convertit **tout** au format E.164 (`+229XXXXXXXX`).

## 🎯 Numéros de test Twilio

Pour tester sans envoyer de vrais SMS :

1. Dans le dashboard Twilio, aller dans **Phone Numbers** → **Verified Caller IDs**
2. Ajouter votre numéro de test
3. Utiliser ce numéro pour les tests

Ou utiliser les numéros magiques Twilio (mode test) :
- `+15005550006` : Numéro valide (ne reçoit pas vraiment le SMS)
- `+15005550001` : Numéro invalide (erreur simulée)

## 🚀 Prochaines étapes

1. ✅ Fonction de formatage implémentée
2. ⏳ Tester avec vrais numéros béninois
3. ⏳ Vérifier les logs lors de l'envoi
4. ⏳ Ajuster si nécessaire selon les retours Twilio

## 💡 Conseils

- **Toujours** enregistrer les numéros au format `0160807271` dans la base de données
- La fonction gère automatiquement tous les formats
- En cas de doute, vérifier les logs pour voir le numéro formaté
- Twilio facture par SMS envoyé, donc tester d'abord avec des numéros vérifiés

## 📝 Notes importantes

### Indicatif Bénin : +229
- Tous les numéros mobiles au Bénin ont **8 chiffres** après l'indicatif
- Format complet : `+229 XX XX XX XX` (11 chiffres au total avec +229)
- Opérateurs principaux :
  - MTN : commence par 96, 97, 66, 67
  - Moov : commence par 60, 61, 62, 63, 64, 65, 69, 90, 91, 94, 95, 98, 99

### Validation supplémentaire (optionnelle)

Si vous voulez valider que c'est bien un numéro mobile béninois :

```javascript
function isValidBeninMobile(phone) {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return false;
  
  // Extraire les 2 premiers chiffres après +229
  const prefix = formatted.substring(4, 6);
  
  // Préfixes valides pour mobiles béninois
  const validPrefixes = ['96', '97', '66', '67', '60', '61', '62', '63', '64', '65', '69', '90', '91', '94', '95', '98', '99'];
  
  return validPrefixes.includes(prefix);
}
```

---

**Prêt pour les tests ! 🎉**
