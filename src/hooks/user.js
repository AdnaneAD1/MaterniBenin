"use client";
import  { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    where,
    limit as fsLimit,
    onSnapshot,
    getDoc,
} from "firebase/firestore";

export function useUser() {
    const [sagesFemmes, setSagesFemmes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, "users"), where("role", "==", "sage-femme")),
            (snapshot) => {
                const sagesFemmes = snapshot.docs.map((doc) => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                setSagesFemmes(sagesFemmes);
            }, 
            (error) => {
                setError(error);
            }
        );

        return () => unsubscribe();
    }, []);

    const getUsersWithDetails = async () => {
        try {
            setLoading(true);
            
            // Get sage-femme and responsable users
            const usersQuery = query(
                collection(db, "users"),
                where("role", "in", ["sage-femme", "responsable"])
            );
            const usersSnapshot = await getDocs(usersQuery);
            const usersWithDetails = [];
            
            for (const userDoc of usersSnapshot.docs) {
                const userData = { id: userDoc.id, ...userDoc.data() };
                
                // Structure data based on createUser function attributes
                const userWithDetails = {
                    id: userDoc.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    displayName: userData.displayName,
                    phoneNumber: userData.phoneNumber,
                    role: userData.role,
                    createdAt: userData.createdAt,
                    createdBy: userData.createdBy,
                    statut: "Actif" // Default status
                };
                
                usersWithDetails.push(userWithDetails);
            }
            
            // Sort by creation date (most recent first)
            usersWithDetails.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
            
            setLoading(false);
            return { success: true, users: usersWithDetails };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const deleteUser = async (userId) => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, "users", userId));
            setLoading(false);
            return { success: true };
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    return { sagesFemmes, loading, error, getUsersWithDetails, deleteUser };
}