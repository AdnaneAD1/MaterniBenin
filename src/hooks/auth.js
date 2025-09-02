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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setCurrentUser(user);
            } else {
                setUser(null);
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          setUser(cred.user);
          setCurrentUser(cred.user);
          setLoading(false);
          return cred.user;
        } catch (err) {
          setError(err.message || "Erreur de connexion");
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

    // Créer un utilisateur via l'API Admin (mot de passe généré automatiquement côté serveur)
    const createUser = async ({ email, firstName, lastName, phoneNumber} = {}) => {
        setLoading(true);
        setError(null);
        try {
            if (!email) throw new Error('Email requis');

            const displayName = `${firstName} ${lastName}`;
            const role = "sage-femme";
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, displayName, phoneNumber, role })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Erreur lors de la création de l\'utilisateur');
            }

            // data contient: uid, email, displayName, phoneNumber, role, generatedPassword
            // Enregistrer dans Firestore (ne pas stocker le mot de passe)
            const { uid, email: savedEmail, displayName: savedName, phoneNumber: savedPhone, role: savedRole } = data || {};
            if (uid) {
                const userDoc = {
                    email: savedEmail || email,
                    firstName: firstName || "",
                    lastName: lastName || "",
                    displayName: savedName || displayName || "",
                    phoneNumber: savedPhone || phoneNumber || "",
                    role: savedRole || role || "sage-femme",
                    createdAt: serverTimestamp(),
                    createdBy: (typeof window !== 'undefined' && auth?.currentUser?.uid) ? auth.currentUser.uid : null,
                };
                await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
            }

            setLoading(false);
            return data;
        } catch (err) {
            setError(err.message || 'Erreur lors de la création de l\'utilisateur');
            setLoading(false);
            throw err;
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