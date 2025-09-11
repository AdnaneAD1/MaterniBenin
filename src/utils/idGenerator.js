import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

/**
 * Génère un ID personnalisé avec le format PREFIX + DATE (DDMMYY) + 2 caractères aléatoires
 * @param {string} prefix - Le préfixe (PT, DM, PF, AC, CPN, RP, EF)
 * @param {string} collectionName - Nom de la collection Firestore pour vérifier l'unicité
 * @returns {Promise<string>} - L'ID généré unique
 */
export const generateCustomId = async (prefix, collectionName) => {
  const generateId = () => {
    // Générer la date au format DDMMYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const dateStr = `${day}${month}${year}`;
    
    // Générer 2 caractères aléatoires (lettres majuscules et chiffres)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomChars = Array.from({ length: 2 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    
    return `${prefix}${dateStr}${randomChars}`;
  };

  // Vérifier l'unicité et régénérer si nécessaire
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateId();
    
    try {
      // Vérifier si l'ID existe déjà dans la collection
      const q = query(collection(db, collectionName), where('__name__', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return id; // ID unique trouvé
      }
      
      attempts++;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'unicité:', error);
      // En cas d'erreur, retourner l'ID généré
      return id;
    }
  }
  
  // Si on n'arrive pas à générer un ID unique après maxAttempts, retourner le dernier généré
  console.warn(`Impossible de générer un ID unique après ${maxAttempts} tentatives`);
  return generateId();
};

/**
 * Préfixes disponibles pour les différents types d'entités
 */
export const ID_PREFIXES = {
  PATIENT: 'PT',
  DOSSIER_MEDICAL: 'DM',
  PLANIFICATION_FAMILIALE: 'PF',
  ACCOUCHEMENT: 'AC',
  CPN: 'CPN',
  RAPPORT: 'RP',
  ENFANT: 'EF',
  GROSSESSE: 'GS'
};

/**
 * Mapping des préfixes vers les noms de collections Firestore
 */
export const COLLECTION_MAPPING = {
  [ID_PREFIXES.PATIENT]: 'patientes',
  [ID_PREFIXES.DOSSIER_MEDICAL]: 'dossiers',
  [ID_PREFIXES.PLANIFICATION_FAMILIALE]: 'planifications',
  [ID_PREFIXES.ACCOUCHEMENT]: 'accouchements',
  [ID_PREFIXES.CPN]: 'cpns',
  [ID_PREFIXES.RAPPORT]: 'rapports',
  [ID_PREFIXES.ENFANT]: 'enfants',
  [ID_PREFIXES.GROSSESSE]: 'grossesses'
};

/**
 * Fonctions helper pour générer des IDs spécifiques
 */
export const generatePatientId = () => generateCustomId(ID_PREFIXES.PATIENT, COLLECTION_MAPPING[ID_PREFIXES.PATIENT]);
export const generateDossierMedicalId = () => generateCustomId(ID_PREFIXES.DOSSIER_MEDICAL, COLLECTION_MAPPING[ID_PREFIXES.DOSSIER_MEDICAL]);
export const generatePlanificationId = () => generateCustomId(ID_PREFIXES.PLANIFICATION_FAMILIALE, COLLECTION_MAPPING[ID_PREFIXES.PLANIFICATION_FAMILIALE]);
export const generateAccouchementId = () => generateCustomId(ID_PREFIXES.ACCOUCHEMENT, COLLECTION_MAPPING[ID_PREFIXES.ACCOUCHEMENT]);
export const generateCpnId = () => generateCustomId(ID_PREFIXES.CPN, COLLECTION_MAPPING[ID_PREFIXES.CPN]);
export const generateRapportId = () => generateCustomId(ID_PREFIXES.RAPPORT, COLLECTION_MAPPING[ID_PREFIXES.RAPPORT]);
export const generateEnfantId = () => generateCustomId(ID_PREFIXES.ENFANT, COLLECTION_MAPPING[ID_PREFIXES.ENFANT]);
export const generateGrossesseId = () => generateCustomId(ID_PREFIXES.GROSSESSE, COLLECTION_MAPPING[ID_PREFIXES.GROSSESSE]);
