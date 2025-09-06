import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary (à configurer avec vos variables d'environnement)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Hook pour gérer l'upload de fichiers vers Cloudinary
 * Supporte les images, documents, vidéos et autres types de fichiers
 */

/**
 * Upload un PDF vers Cloudinary
 * @param {Buffer} pdfBuffer - Buffer du PDF généré
 * @param {string} fileName - Nom du fichier
 * @param {string} folder - Dossier de destination sur Cloudinary
 * @returns {Promise<Object>} Résultat de l'upload avec URL
 */
export const uploadPDFToCloudinary = async (pdfBuffer, fileName, folder = 'rapports') => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw', // Pour les fichiers PDF
                    public_id: `${folder}/${fileName}`,
                    format: 'pdf',
                    tags: ['rapport', 'medical', 'dashboard'],
                    context: {
                        generated_at: new Date().toISOString(),
                        type: 'medical_report'
                    }
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            success: true,
                            url: result.secure_url,
                            public_id: result.public_id,
                            bytes: result.bytes,
                            format: result.format,
                            created_at: result.created_at
                        });
                    }
                }
            );

            uploadStream.end(pdfBuffer);
        });
    } catch (error) {
        throw new Error(`Erreur lors de l'upload vers Cloudinary: ${error.message}`);
    }
};

/**
 * Génère un nom de fichier unique pour le rapport
 * @param {string} reportType - Type de rapport (CPN, Accouchement, Planification)
 * @param {string} month - Mois
 * @param {number} year - Année
 * @returns {string} Nom de fichier unique
 */
export const generateReportFileName = (reportType, month, year) => {
    const timestamp = new Date().getTime();
    const sanitizedType = reportType.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const sanitizedMonth = month.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    return `rapport_${sanitizedType}_${sanitizedMonth}_${year}_${timestamp}`;
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId - ID public du fichier sur Cloudinary
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw'
        });
        
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
};

/**
 * Liste tous les rapports stockés sur Cloudinary
 * @param {string} folder - Dossier à explorer
 * @returns {Promise<Array>} Liste des fichiers
 */
export const listCloudinaryReports = async (folder = 'rapports') => {
    try {
        const result = await cloudinary.search
            .expression(`folder:${folder} AND tags:rapport`)
            .sort_by([['created_at', 'desc']])
            .max_results(100)
            .execute();
        
        return result.resources.map(resource => ({
            public_id: resource.public_id,
            url: resource.secure_url,
            created_at: resource.created_at,
            bytes: resource.bytes,
            filename: resource.filename || resource.public_id.split('/').pop()
        }));
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des rapports: ${error.message}`);
    }
};

/**
 * Upload une image sur Cloudinary et retourne l'URL sécurisée
 * @param {File} imageFile - Fichier image à uploader
 * @returns {Promise<string>} L'URL Cloudinary de l'image
 */
export async function uploadImageToCloudinary(imageFile) {
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !uploadPreset) {
        throw new Error("Configuration Cloudinary manquante. Vérifiez vos variables d'environnement.");
    }
    
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", uploadPreset);
    
    try {
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: data
        });
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const cloudinary = await res.json();
        
        if (!cloudinary.secure_url) {
            throw new Error("Échec de l'upload de l'image - URL manquante");
        }
        
        return cloudinary.secure_url;
    } catch (err) {
        console.error("Erreur lors de l'upload de l'image:", err);
        throw new Error("Erreur lors de l'upload de l'image");
    }
}

/**
 * Upload un fichier (PDF, docx, zip, etc.) sur Cloudinary (resource_type: 'raw') et retourne l'URL sécurisée
 * @param {File} file - Fichier à uploader
 * @returns {Promise<string>} L'URL Cloudinary du fichier
 */
export async function uploadFileToCloudinary(file) {
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !uploadPreset) {
        throw new Error("Configuration Cloudinary manquante. Vérifiez vos variables d'environnement.");
    }
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    
    try {
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: data
        });
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const cloudinary = await res.json();
        
        if (!cloudinary.secure_url) {
            throw new Error("Échec de l'upload du fichier - URL manquante");
        }
        
        return cloudinary.secure_url;
    } catch (err) {
        console.error("Erreur lors de l'upload du fichier:", err);
        throw new Error("Erreur lors de l'upload du fichier");
    }
}

/**
 * Upload une vidéo sur Cloudinary et retourne l'URL sécurisée
 * @param {File} videoFile - Fichier vidéo à uploader
 * @returns {Promise<string>} L'URL Cloudinary de la vidéo
 */
export async function uploadVideoToCloudinary(videoFile) {
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !uploadPreset) {
        throw new Error("Configuration Cloudinary manquante. Vérifiez vos variables d'environnement.");
    }
    
    const data = new FormData();
    data.append("file", videoFile);
    data.append("upload_preset", uploadPreset);
    
    try {
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: data
        });
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const cloudinary = await res.json();
        
        if (!cloudinary.secure_url) {
            throw new Error("Échec de l'upload de la vidéo - URL manquante");
        }
        
        return cloudinary.secure_url;
    } catch (err) {
        console.error("Erreur lors de l'upload de la vidéo:", err);
        throw new Error("Erreur lors de l'upload de la vidéo");
    }
}

/**
 * Upload automatique basé sur le type de fichier
 * @param {File} file - Fichier à uploader
 * @returns {Promise<string>} L'URL Cloudinary du fichier
 */
export async function uploadToCloudinary(file) {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
        return uploadImageToCloudinary(file);
    } else if (fileType.startsWith('video/')) {
        return uploadVideoToCloudinary(file);
    } else {
        // Pour tous les autres types (documents, PDF, etc.)
        return uploadFileToCloudinary(file);
    }
}

/**
 * Obtenir les informations détaillées d'un fichier uploadé
 * @param {File} file - Fichier à analyser
 * @returns {Object} Informations sur le fichier
 */
export function getFileInfo(file) {
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isImage: file.type.startsWith('image/'),
        isVideo: file.type.startsWith('video/'),
        isDocument: !file.type.startsWith('image/') && !file.type.startsWith('video/'),
        sizeFormatted: formatFileSize(file.size)
    };
}

/**
 * Formater la taille d'un fichier en format lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée (ex: "1.5 MB")
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Valider un fichier avant upload
 * @param {File} file - Fichier à valider
 * @param {number} maxSize - Taille maximale en bytes (défaut: 10MB)
 * @param {string[]} allowedTypes - Types de fichiers autorisés
 * @returns {boolean} true si valide, sinon throw une erreur
 */
export function validateFile(
    file, 
    maxSize = 10 * 1024 * 1024, // 10MB par défaut
    allowedTypes
) {
    if (file.size > maxSize) {
        throw new Error(`Le fichier est trop volumineux. Taille maximale: ${formatFileSize(maxSize)}`);
    }
    
    if (allowedTypes && !allowedTypes.some(type => file.type.startsWith(type))) {
        throw new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
    }
    
    return true;
}

// Exemples d'utilisation :
// const imageUrl = await uploadImageToCloudinary(imageFile);
// const documentUrl = await uploadFileToCloudinary(pdfFile);
// const videoUrl = await uploadVideoToCloudinary(videoFile);
// const url = await uploadToCloudinary(anyFile); // Upload automatique basé sur le type
