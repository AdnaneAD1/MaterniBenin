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

    return { sagesFemmes, loading, error };
}