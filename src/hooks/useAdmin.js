"use client";

import { useState } from "react";
import { db, auth } from "@/firebase/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp,
    deleteDoc,
    setDoc
} from "firebase/firestore";

export function useAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Créer un nouveau centre de santé
     * @param {Object} centreData - Données du centre
     * @returns {Promise<{success: boolean, centreId?: string, error?: string}>}
     */
    const createCentre = async (centreData) => {
        try {
            setLoading(true);
            setError(null);

            if (!centreData.nom) throw new Error('Le nom du centre est requis');
            if (!centreData.adresse) throw new Error('L\'adresse est requise');
            if (!centreData.telephone) throw new Error('Le téléphone est requis');
            if (!centreData.email) throw new Error('L\'email est requis');

            const centreRef = await addDoc(collection(db, 'centres'), {
                nom: centreData.nom,
                adresse: centreData.adresse,
                telephone: centreData.telephone,
                email: centreData.email,
                responsableId: null,
                responsableNom: null,
                responsableEmail: null,
                licenceAchetee: true,
                dateLicenceAchat: serverTimestamp(),
                statut: 'actif',
                dateCreation: serverTimestamp(),
                dateModification: serverTimestamp()
            });

            setLoading(false);
            return { success: true, centreId: centreRef.id };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de la création du centre';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Récupérer tous les centres
     * @returns {Promise<{success: boolean, centres?: Array, error?: string}>}
     */
    const listCentres = async () => {
        try {
            setLoading(true);
            setError(null);

            const querySnapshot = await getDocs(collection(db, 'centres'));
            const centres = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setLoading(false);
            return { success: true, centres };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de la récupération des centres';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Assigner un responsable à un centre
     * @param {string} centreId - ID du centre
     * @param {string} userId - ID de l'utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const assignResponsable = async (centreId, userId, userData) => {
        try {
            setLoading(true);
            setError(null);

            if (!centreId) throw new Error('L\'ID du centre est requis');
            if (!userId) throw new Error('L\'ID de l\'utilisateur est requis');

            // Mettre à jour le centre avec les infos du responsable
            await updateDoc(doc(db, 'centres', centreId), {
                responsableId: userId,
                responsableNom: `${userData.firstName} ${userData.lastName}`,
                responsableEmail: userData.email,
                dateModification: serverTimestamp()
            });

            // Mettre à jour l'utilisateur avec le rôle et le centreId
            await updateDoc(doc(db, 'users', userId), {
                role: 'responsable',
                centreId: centreId,
                dateModification: serverTimestamp()
            });

            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de l\'assignation du responsable';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Récupérer tous les utilisateurs d'un centre
     * @param {string} centreId - ID du centre
     * @returns {Promise<{success: boolean, users?: Array, error?: string}>}
     */
    const listUsersByCentre = async (centreId) => {
        try {
            setLoading(true);
            setError(null);

            if (!centreId) throw new Error('L\'ID du centre est requis');

            const q = query(
                collection(db, 'users'),
                where('centreId', '==', centreId)
            );

            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setLoading(false);
            return { success: true, users };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de la récupération des utilisateurs';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Changer le rôle d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} newRole - Nouveau rôle ('sage-femme' ou 'responsable')
     * @param {string} centreId - ID du centre (requis si newRole = 'responsable')
     * @param {boolean} confirmReplaceResponsable - Confirmer le remplacement du responsable
     * @returns {Promise<{success: boolean, existingResponsable?: Object, needsConfirmation?: boolean, error?: string}>}
     */
    const changeUserRole = async (userId, newRole, centreId, confirmReplaceResponsable = false) => {
        try {
            setLoading(true);
            setError(null);

            if (!userId) throw new Error('L\'ID de l\'utilisateur est requis');
            if (!newRole) throw new Error('Le nouveau rôle est requis');

            const validRoles = ['sage-femme', 'responsable'];
            if (!validRoles.includes(newRole)) {
                throw new Error('Rôle invalide. Doit être "sage-femme" ou "responsable"');
            }

            // Récupérer les données de l'utilisateur
            const userDoc = await getDocs(query(
                collection(db, 'users'),
                where('__name__', '==', userId)
            ));
            
            if (userDoc.empty) throw new Error('Utilisateur non trouvé');
            const userData = userDoc.docs[0].data();

            // Si on change vers responsable, vérifier qu'il n'y a pas déjà un responsable
            if (newRole === 'responsable' && centreId) {
                const q = query(
                    collection(db, 'users'),
                    where('centreId', '==', centreId),
                    where('role', '==', 'responsable')
                );
                const querySnapshot = await getDocs(q);
                
                // S'il y a déjà un responsable et ce n'est pas l'utilisateur actuel
                if (querySnapshot.docs.length > 0 && querySnapshot.docs[0].id !== userId) {
                    const existingResponsable = {
                        id: querySnapshot.docs[0].id,
                        ...querySnapshot.docs[0].data()
                    };

                    // Si pas confirmé, retourner l'info du responsable existant
                    if (!confirmReplaceResponsable) {
                        setLoading(false);
                        return {
                            success: false,
                            needsConfirmation: true,
                            existingResponsable,
                            error: `Un responsable existe déjà : ${existingResponsable.firstName} ${existingResponsable.lastName}. Confirmez pour le rétrograder en sage-femme.`
                        };
                    }

                    // Rétrograder l'ancien responsable en sage-femme
                    await updateDoc(doc(db, 'users', existingResponsable.id), {
                        role: 'sage-femme',
                        dateModification: serverTimestamp()
                    });
                    
                    // Mettre à jour le centre : réinitialiser les infos du responsable
                    await updateDoc(doc(db, 'centres', centreId), {
                        responsableId: null,
                        responsableNom: null,
                        responsableEmail: null,
                        dateModification: serverTimestamp()
                    });
                }
            }

            // Mettre à jour l'utilisateur
            await updateDoc(doc(db, 'users', userId), {
                role: newRole,
                dateModification: serverTimestamp()
            });

            // Si on promeut en responsable, mettre à jour le centre
            if (newRole === 'responsable' && centreId) {
                await updateDoc(doc(db, 'centres', centreId), {
                    responsableId: userId,
                    responsableNom: `${userData.firstName} ${userData.lastName}`,
                    responsableEmail: userData.email,
                    dateModification: serverTimestamp()
                });
            }

            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors du changement de rôle';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Créer un utilisateur (sage-femme ou responsable)
     * @param {Object} userData - Données de l'utilisateur
     * @param {string} userData.email - Email
     * @param {string} userData.firstName - Prénom
     * @param {string} userData.lastName - Nom
     * @param {string} userData.phoneNumber - Téléphone
     * @param {string} userData.centreId - ID du centre
     * @param {string} userData.role - Rôle ('sage-femme' ou 'responsable')
     * @param {boolean} userData.confirmReplaceResponsable - Confirmer le remplacement du responsable
     * @returns {Promise<{success: boolean, uid?: string, existingResponsable?: Object, needsConfirmation?: boolean, error?: string}>}
     */
    const createUser = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            if (!userData.email) throw new Error('L\'email est requis');
            if (!userData.firstName) throw new Error('Le prénom est requis');
            if (!userData.lastName) throw new Error('Le nom est requis');
            if (!userData.centreId) throw new Error('Le centre est requis');
            if (!userData.role) throw new Error('Le rôle est requis');

            const validRoles = ['sage-femme', 'responsable'];
            if (!validRoles.includes(userData.role)) {
                throw new Error('Rôle invalide. Doit être "sage-femme" ou "responsable"');
            }

            // Si on crée un responsable, vérifier qu'il n'y a pas déjà un responsable
            if (userData.role === 'responsable') {
                const q = query(
                    collection(db, 'users'),
                    where('centreId', '==', userData.centreId),
                    where('role', '==', 'responsable')
                );
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.docs.length > 0) {
                    const existingResponsable = {
                        id: querySnapshot.docs[0].id,
                        ...querySnapshot.docs[0].data()
                    };

                    // Si pas confirmé, retourner l'info du responsable existant
                    if (!userData.confirmReplaceResponsable) {
                        setLoading(false);
                        return {
                            success: false,
                            needsConfirmation: true,
                            existingResponsable,
                            error: `Un responsable existe déjà : ${existingResponsable.firstName} ${existingResponsable.lastName}. Confirmez pour le rétrograder en sage-femme.`
                        };
                    }

                    // Rétrograder l'ancien responsable en sage-femme
                    await updateDoc(doc(db, 'users', existingResponsable.id), {
                        role: 'sage-femme',
                        dateModification: serverTimestamp()
                    });
                    
                    // Mettre à jour le centre : réinitialiser les infos du responsable
                    await updateDoc(doc(db, 'centres', userData.centreId), {
                        responsableId: null,
                        responsableNom: null,
                        responsableEmail: null,
                        dateModification: serverTimestamp()
                    });
                }
            }

            // Appeler l'API pour créer l'utilisateur dans Firebase Auth
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    displayName: `${userData.firstName} ${userData.lastName}`,
                    centreId: userData.centreId,
                    role: userData.role
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Erreur lors de la création de l\'utilisateur');
            }

            // Enregistrer l'utilisateur dans Firestore
            const { uid, email: savedEmail, displayName: savedName } = data || {};
            if (uid) {
                const userDoc = {
                    email: savedEmail || userData.email,
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    displayName: savedName || `${userData.firstName} ${userData.lastName}` || "",
                    phoneNumber: userData.phoneNumber || "",
                    role: userData.role || "sage-femme",
                    centreId: userData.centreId || null,
                    createdAt: serverTimestamp(),
                    createdBy: auth?.currentUser?.uid || null,
                };
                await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
            }

            // Si on crée un responsable, mettre à jour le centre
            if (userData.role === 'responsable') {
                await updateDoc(doc(db, 'centres', userData.centreId), {
                    responsableId: data.uid,
                    responsableNom: `${userData.firstName} ${userData.lastName}`,
                    responsableEmail: userData.email,
                    dateModification: serverTimestamp()
                });
            }

            setLoading(false);
            return { success: true, uid: data.uid, generatedPassword: data.generatedPassword };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de la création de l\'utilisateur';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    /**
     * Supprimer un utilisateur d'un centre
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const removeUserFromCentre = async (userId) => {
        try {
            setLoading(true);
            setError(null);

            if (!userId) throw new Error('L\'ID de l\'utilisateur est requis');

            // Supprimer le document utilisateur
            await deleteDoc(doc(db, 'users', userId));

            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Erreur lors de la suppression de l\'utilisateur';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    return {
        loading,
        error,
        createCentre,
        listCentres,
        assignResponsable,
        listUsersByCentre,
        createUser,
        changeUserRole,
        removeUserFromCentre
    };
}
