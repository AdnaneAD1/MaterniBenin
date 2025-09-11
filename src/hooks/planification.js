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
    setDoc,
} from "firebase/firestore";
import { useAuth } from "./auth";
import { generatePlanificationId } from "@/utils/idGenerator";

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
            
            // Générer un ID personnalisé pour la planification
            const planificationId = await generatePlanificationId();
            const planificationData = {
                methodeChoisis: planification.methodeChoisis,
                sexe: planification.sexe,
                personneId: personneRef.id,
                consultationId: conRef.id,
                createdAt: Timestamp.now(),
            };
            await setDoc(doc(db, "planifications", planificationId), planificationData);
            
            return {success: true, planificationId: planificationId, consultationId: conRef.id, personneId: personneRef.id};
        } catch (error) {
            setError(error);
            return {success: false, error};
        }
    };

    // Update an existing planification record and related docs
    const updatePlanification = async (payload) => {
        const {
            planificationId,
            personneId,
            consultationId,
            nom,
            prenom,
            age,
            telephone,
            adresse,
            methodeChoisis,
            sexe,
            diagnostique,
            rdv,
        } = payload || {};
        try {
            // Update related person
            if (personneId) {
                await updateDoc(doc(db, "personnes", personneId), {
                    nom,
                    prenom,
                    age,
                    telephone,
                    adresse,
                });
            }

            // Update planification main document
            if (planificationId) {
                await updateDoc(doc(db, "planifications", planificationId), {
                    methodeChoisis,
                    sexe,
                });
            }

            // Update consultation document
            if (consultationId) {
                await updateDoc(doc(db, "consultations", consultationId), {
                    diagnostique,
                    rdv,
                });
            }

            return { success: true };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const getPlanificationsWithDetails = async () => {
        try {
            setLoading(true);
            
            // Get all planifications
            const planificationsSnapshot = await getDocs(collection(db, "planifications"));
            const planificationsWithDetails = [];
            
            for (const planificationDoc of planificationsSnapshot.docs) {
                const planificationData = { id: planificationDoc.id, ...planificationDoc.data() };
                
                // Get person details
                const personneDoc = await getDoc(doc(db, "personnes", planificationData.personneId));
                const personneData = personneDoc.exists() ? personneDoc.data() : {};
                
                // Get consultation details to get RDV
                let prochaineVisite = null;
                let diagnostique = null;
                if (planificationData.consultationId) {
                    const consultationDoc = await getDoc(doc(db, "consultations", planificationData.consultationId));
                    if (consultationDoc.exists()) {
                        const consultationData = consultationDoc.data();
                        prochaineVisite = consultationData.rdv;
                        diagnostique = consultationData.diagnostique || null;
                    }
                }
                
                // Combine all data
                const planificationWithDetails = {
                    id: planificationDoc.id,
                    ...personneData,
                    methodeChoisis: planificationData.methodeChoisis,
                    sexe: planificationData.sexe,
                    prochaineVisite: prochaineVisite,
                    diagnostique: diagnostique,
                    statut: "Terminée", // Default status as requested
                    planificationId: planificationDoc.id,
                    personneId: planificationData.personneId,
                    consultationId: planificationData.consultationId,
                    createdAt: planificationData.createdAt
                };
                
                planificationsWithDetails.push(planificationWithDetails);
            }
            
            // Sort by creation date (most recent first)
            planificationsWithDetails.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
            
            setLoading(false);
            return { success: true, planifications: planificationsWithDetails };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getPlanificationStats = async () => {
        try {
            setLoading(true);
            
            // Get all planifications
            const planificationsSnapshot = await getDocs(collection(db, "planifications"));
            const totalPlanifications = planificationsSnapshot.size;
            
            // Get planifications this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            
            const planificationsThisMonthQuery = query(
                collection(db, "planifications"),
                where("createdAt", ">=", Timestamp.fromDate(currentMonth))
            );
            const planificationsThisMonthSnapshot = await getDocs(planificationsThisMonthQuery);
            const planificationsThisMonth = planificationsThisMonthSnapshot.size;
            
            // Count by contraceptive method
            let implant = 0;
            let pilule = 0;
            let injectable = 0;
            let diu = 0;
            let preservatif = 0;
            let autre = 0;
            
            // Count by gender
            let feminin = 0;
            let masculin = 0;
            
            for (const planificationDoc of planificationsSnapshot.docs) {
                const planificationData = planificationDoc.data();
                const methode = planificationData.methodeChoisis?.toLowerCase() || '';
                const sexe = planificationData.sexe?.toLowerCase() || '';
                
                // Count by method
                if (methode.includes('implant')) {
                    implant++;
                } else if (methode.includes('pilule')) {
                    pilule++;
                } else if (methode.includes('injectable')) {
                    injectable++;
                } else if (methode.includes('diu')) {
                    diu++;
                } else if (methode.includes('préservatif') || methode.includes('preservatif')) {
                    preservatif++;
                } else {
                    autre++;
                }
                
                // Count by gender
                if (sexe.includes('féminin') || sexe.includes('feminin')) {
                    feminin++;
                } else if (sexe.includes('masculin')) {
                    masculin++;
                }
            }
            
            // Get consultations this month for planification
            const consultationsThisMonthQuery = query(
                collection(db, "consultations"),
                where("type", "==", "planification"),
                where("dateConsultation", ">=", Timestamp.fromDate(currentMonth))
            );
            const consultationsThisMonthSnapshot = await getDocs(consultationsThisMonthQuery);
            const consultationsThisMonth = consultationsThisMonthSnapshot.size;
            
            const stats = {
                totalPlanifications,
                planificationsThisMonth,
                consultationsThisMonth,
                methodesContraceptives: {
                    implant,
                    pilule,
                    injectable,
                    diu,
                    preservatif,
                    autre
                },
                repartitionGenre: {
                    feminin,
                    masculin
                },
                methodePopulaire: getMostPopularMethod({
                    implant,
                    pilule,
                    injectable,
                    diu,
                    preservatif,
                    autre
                })
            };
            
            setLoading(false);
            return { success: true, stats };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };
    
    const getMostPopularMethod = (methods) => {
        const methodNames = {
            implant: 'Implant',
            pilule: 'Pilule',
            injectable: 'Injectable',
            diu: 'DIU',
            preservatif: 'Préservatif',
            autre: 'Autre'
        };
        
        let maxCount = 0;
        let popularMethod = 'Aucune';
        
        for (const [method, count] of Object.entries(methods)) {
            if (count > maxCount) {
                maxCount = count;
                popularMethod = methodNames[method];
            }
        }
        
        return popularMethod;
    };

    return { planifications, loading, error, addPlanification, updatePlanification, getPlanificationsWithDetails, getPlanificationStats };
}
