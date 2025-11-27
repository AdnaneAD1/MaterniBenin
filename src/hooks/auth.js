"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export function useAuth() {
    const [user, setUser] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Récupérer les données utilisateur depuis Firestore
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const userWithRole = {
                            ...user,
                            email: user.email,
                            role: userData.role,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            displayName: userData.displayName,
                            phoneNumber: userData.phoneNumber,
                            centreId: userData.centreId
                        };
                        setUser(userWithRole);
                        setCurrentUser(userWithRole);
                    } else {
                        setUser(user);
                        setCurrentUser(user);
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des données utilisateur:', error);
                    setUser(user);
                    setCurrentUser(user);
                }
            } else {
                setUser(null);
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          
          // Récupérer les données utilisateur depuis Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userWithRole = {
                ...cred.user,
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName,
                displayName: userData.displayName,
                phoneNumber: userData.phoneNumber,
                centreId: userData.centreId
              };
              setUser(userWithRole);
              setCurrentUser(userWithRole);
            } else {
              setUser(cred.user);
              setCurrentUser(cred.user);
            }
          } catch (firestoreError) {
            console.error('Erreur lors de la récupération des données utilisateur:', firestoreError);
            setUser(cred.user);
            setCurrentUser(cred.user);
          }
          
          setLoading(false);
          return cred.user;
        } catch (err) {
          const translatedError = translateError(err);
          setError(translatedError);
          setLoading(false);
          throw err;
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
          await signOut(auth);
          setUser(null);
          setCurrentUser(null);
          setLoading(false);
        } catch (err) {
          setError(err.message || "Erreur de déconnexion");
          setLoading(false);
        }
    };

    // Fonction pour formater le numéro de téléphone au format E.164
    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return null;
        
        // Nettoyer le numéro (enlever espaces, tirets, etc.)
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        // Si le numéro commence par 0, le remplacer par +229 (Bénin)
        if (cleaned.startsWith('0')) {
            cleaned = '+229' + cleaned.substring(1);
        }
        // Si le numéro ne commence pas par +, ajouter +229
        else if (!cleaned.startsWith('+')) {
            cleaned = '+229' + cleaned;
        }
        
        return cleaned;
    };

    // Fonction pour traduire les erreurs en français
    const translateError = (error) => {
        const errorMessage = error.message || error.toString();
        
        // Erreurs d'authentification Firebase
        if (errorMessage.includes('auth/user-not-found')) {
            return 'Aucun compte trouvé avec cette adresse email';
        }
        if (errorMessage.includes('auth/wrong-password')) {
            return 'Mot de passe incorrect';
        }
        if (errorMessage.includes('auth/invalid-email')) {
            return 'L\'adresse email n\'est pas valide';
        }
        if (errorMessage.includes('auth/user-disabled')) {
            return 'Ce compte a été désactivé';
        }
        if (errorMessage.includes('auth/too-many-requests')) {
            return 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
        }
        if (errorMessage.includes('auth/network-request-failed')) {
            return 'Erreur de connexion réseau. Vérifiez votre connexion internet';
        }
        if (errorMessage.includes('auth/invalid-credential')) {
            return 'Identifiants invalides. Vérifiez votre email et mot de passe';
        }
        if (errorMessage.includes('auth/email-already-in-use')) {
            return 'Cette adresse email est déjà utilisée par un autre compte';
        }
        if (errorMessage.includes('auth/weak-password')) {
            return 'Le mot de passe est trop faible (minimum 6 caractères)';
        }
        if (errorMessage.includes('phone number must be a non-empty E.164')) {
            return 'Le numéro de téléphone doit être au format international valide (ex: +22997000001)';
        }
        
        return 'Une erreur est survenue lors de la connexion. Veuillez réessayer';
    };

    // Créer un utilisateur via l'API Admin (mot de passe généré automatiquement côté serveur)
    const createUser = async ({ email, firstName, lastName, phoneNumber, centreId, role = 'sage-femme' } = {}) => {
        setLoading(true);
        setError(null);
        try {
            if (!email) throw new Error('L\'adresse email est requise');
            if (!firstName) throw new Error('Le prénom est requis');
            if (!lastName) throw new Error('Le nom est requis');
            if (!centreId) throw new Error('Le centre est requis');
            
            const displayName = `${firstName} ${lastName}`;
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, displayName, centreId, role })
            });

            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data?.error || 'Erreur lors de la création de l\'utilisateur';
                throw new Error(translateError({ message: errorMsg }));
            }

            // data contient: uid, email, displayName, phoneNumber, role, generatedPassword
            // Enregistrer dans Firestore (ne pas stocker le mot de passe)
            const { uid, email: savedEmail, displayName: savedName } = data || {};
            if (uid) {
                const userDoc = {
                    email: savedEmail || email,
                    firstName: firstName || "",
                    lastName: lastName || "",
                    displayName: savedName || displayName || "",
                    phoneNumber: phoneNumber || "",
                    role: role || "sage-femme",
                    centreId: centreId || null,
                    createdAt: serverTimestamp(),
                    createdBy: (typeof window !== 'undefined' && auth?.currentUser?.uid) ? auth.currentUser.uid : null,
                };
                await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
            }

            setLoading(false);
            return data;
        } catch (err) {
            const translatedError = translateError(err);
            setError(translatedError);
            setLoading(false);
            throw new Error(translatedError);
        }
    };

    return {
        user,
        currentUser,
        loading,
        error,
        login,
        logout,
        createUser,
    };
}