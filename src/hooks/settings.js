"use client";

import { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";

export function useSettings() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Récupérer les informations de l'utilisateur actuel
    const getCurrentUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("Aucun utilisateur connecté");
            }

            // Récupérer les données depuis Firestore
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            
            if (!userDoc.exists()) {
                throw new Error("Profil utilisateur introuvable");
            }

            const userData = userDoc.data();
            
            setLoading(false);
            return {
                success: true,
                profile: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    displayName: userData.displayName || "",
                    phoneNumber: userData.phoneNumber || "",
                    role: userData.role || "sage-femme",
                    createdAt: userData.createdAt,
                }
            };
        } catch (err) {
            setError(err);
            setLoading(false);
            return { success: false, error: err };
        }
    };

    // Mettre à jour le profil utilisateur
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("Aucun utilisateur connecté");
            }

            const { firstName, lastName, phoneNumber } = profileData;

            // Construire le displayName
            const displayName = `${firstName} ${lastName}`.trim();

            // Mettre à jour dans Firestore
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                firstName: firstName || "",
                lastName: lastName || "",
                displayName: displayName || "",
                phoneNumber: phoneNumber || "",
                updatedAt: Timestamp.now(),
            });

            setLoading(false);
            return { success: true };
        } catch (err) {
            setError(err);
            setLoading(false);
            return { success: false, error: err };
        }
    };

    // Changer le mot de passe
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser || !currentUser.email) {
                throw new Error("Aucun utilisateur connecté");
            }

            // Réauthentifier l'utilisateur avec son mot de passe actuel
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Mettre à jour le mot de passe
            await updatePassword(currentUser, newPassword);

            setLoading(false);
            return { success: true };
        } catch (err) {
            const translatedError = translatePasswordError(err);
            setError(translatedError);
            setLoading(false);
            return { success: false, error: translatedError };
        }
    };

    // Changer l'email
    const changeEmail = async (newEmail, currentPassword) => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = auth.currentUser;
            if (!currentUser || !currentUser.email) {
                throw new Error("Aucun utilisateur connecté");
            }

            // Réauthentifier l'utilisateur
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Mettre à jour l'email dans Firebase Auth
            await updateEmail(currentUser, newEmail);

            // Mettre à jour l'email dans Firestore
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                email: newEmail,
                updatedAt: Timestamp.now(),
            });

            setLoading(false);
            return { success: true };
        } catch (err) {
            const translatedError = translateEmailError(err);
            setError(translatedError);
            setLoading(false);
            return { success: false, error: translatedError };
        }
    };

    // Traduire les erreurs de mot de passe
    const translatePasswordError = (error) => {
        const errorMessage = error.message || error.toString();

        if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/invalid-credential')) {
            return new Error('Le mot de passe actuel est incorrect');
        }
        if (errorMessage.includes('auth/weak-password')) {
            return new Error('Le nouveau mot de passe est trop faible (minimum 6 caractères)');
        }
        if (errorMessage.includes('auth/requires-recent-login')) {
            return new Error('Veuillez vous reconnecter pour effectuer cette action');
        }
        if (errorMessage.includes('auth/too-many-requests')) {
            return new Error('Trop de tentatives. Veuillez réessayer plus tard');
        }

        return new Error('Erreur lors du changement de mot de passe');
    };

    // Traduire les erreurs d'email
    const translateEmailError = (error) => {
        const errorMessage = error.message || error.toString();

        if (errorMessage.includes('auth/invalid-email')) {
            return new Error('L\'adresse email n\'est pas valide');
        }
        if (errorMessage.includes('auth/email-already-in-use')) {
            return new Error('Cette adresse email est déjà utilisée');
        }
        if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/invalid-credential')) {
            return new Error('Le mot de passe est incorrect');
        }
        if (errorMessage.includes('auth/requires-recent-login')) {
            return new Error('Veuillez vous reconnecter pour effectuer cette action');
        }

        return new Error('Erreur lors du changement d\'email');
    };

    return {
        loading,
        error,
        getCurrentUserProfile,
        updateProfile,
        changePassword,
        changeEmail,
    };
}
