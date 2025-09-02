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
import { useAuth } from "./auth";

export function usePlanification() {
    const [planifications, setPlanifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "planifications"), (snapshot) => {
            const planifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPlanifications(planifications);
            setLoading(false);
        }, (error) => {
            setError(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addPlanification = async (planification) => {
        try {
            const personneData = {
                nom: planification.nom,
                prenom: planification.prenom,
                age: planification.age,
                telephone: planification.telephone,
                adresse: planification.adresse,
                createdAt: Timestamp.now(),
            }
            const conRef = await addDoc(collection(db, "consultations"), {
                type: "planification",
                dateConsultation: Timestamp.now(),
                diagnostique: planification.diagnostique,
                rdv: planification.rdv,
                userId: currentUser.uid,
                createdAt: Timestamp.now(),
            });
            const personneRef = await addDoc(collection(db, "personnes"), personneData);
            const docRef = await addDoc(collection(db, "planifications"), {
                methodeChoisis: planification.methodeChoisis,
                sexe: planification.sexe,
                personneId: personneRef.id,
                consultationId: conRef.id,
                createdAt: Timestamp.now(),
            });
            
            return {success: true, planificationId: docRef.id, consultationId: conRef.id, personneId: personneRef.id};
        } catch (error) {
            setError(error);
            return {success: false, error};
        }
    };

    return { planifications, loading, error, addPlanification };
}
