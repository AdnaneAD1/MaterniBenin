"use client";
import { useState, useEffect, useCallback } from "react";
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

export function usePatiente() {
    const [patientes, setPatientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "patientes"), (snapshot) => {
            const patientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPatientes(patientes);
            setLoading(false);
        }, (error) => {
            setError(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addPatient = async (patient) => {
        try {
            const personneData = {
                nom: patient.nom,
                prenom: patient.prenom,
                age: patient.age,
                telephone: patient.telephone,
                adresse: patient.adresse,
                createdAt: Timestamp.now(),
            }
            const personneRef = await addDoc(collection(db, "personnes"), personneData);
            const patientData = {
                personneId: personneRef.id,
                createdAt: Timestamp.now(),
            }
            const patientRef = await addDoc(collection(db, "patientes"), patientData);
            const dossierRef = {
                patientId: patientRef.id,
                createdAt: Timestamp.now(),
            };
            const dossierDocRef = await addDoc(collection(db, "dossiers"), dossierRef);
            return { success: true, patientId: patientRef.id, dossierId: dossierDocRef.id, personneId: personneRef.id };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const addPregnancy = async (dossierId) => {
        try {
            const grossesseDocRef = await addDoc(collection(db, "grossesses"), {
                statut: "En cours",
                dossierId: dossierId,
                createdAt: Timestamp.now(),
            });
            return { success: true, dossierId: dossierId, grossesseId: grossesseDocRef.id };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const addCpn = async (grossesseId, cpn) => {
        try {
            const conRef = await addDoc(collection(db, "consultations"), {
                type: "CPN",
                dateConsultation: Timestamp.now(),
                diagnostique: cpn.diagnostique,
                rdv: cpn.rdv,
                userId: currentUser.uid,
                createdAt: Timestamp.now(),
            });
            const allcpn = await getDocs(query(collection(db, "cpns"), where("grossesseId", "==", grossesseId)));
            const cpnDocRef = await addDoc(collection(db, "cpns"), {
                cpn: "CPN " + (allcpn.docs.length + 1),
                dormirsurmild: cpn.dormirsurmild,
                sulfadoxine: cpn.sulphadoxine,
                mebendazole: cpn.mebendazole,
                ferfoldine: cpn.ferfoldine,
                vat: cpn.vat,
                garedepiste: cpn.garedepiste,
                garerefere: cpn.garerefere,
                conduiteTenue: cpn.conduiteTenue,
                grossesseId: grossesseId,
                consultationId: conRef.id,
                createdAt: Timestamp.now(),
            });
            return { success: true, grossesseId: grossesseId, cpnId: cpnDocRef.id };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const addChildbirth = async (grossesseId, childbirth) => {
        try {
            const accouchementData = {
                nomMari: childbirth.nomMari,
                prenomMari: childbirth.prenomMari,
                heureAdmission: childbirth.heureAdmission,
                dateAdmission: childbirth.dateAdmission,
                heureAccouchement: childbirth.heureAccouchement,
                dateAccouchement: childbirth.dateAccouchement,
                modeAccouchement: childbirth.modeAccouchement,
                note: childbirth.note,
                grossesseId: grossesseId,
                createdAt: Timestamp.now(),
            };
            const accouchementDocRef = await addDoc(collection(db, "accouchements"), accouchementData);
            const childrenPromises = childbirth.enfants.map(async (enfant) => {
                const childData = {
                    nomEnfant: enfant.nomEnfant,
                    prenomEnfant: enfant.prenomEnfant,
                    sexeEnfant: enfant.sexe,
                    poids: enfant.poids,
                    accouchementId: accouchementDocRef.id,
                    createdAt: Timestamp.now(),
                };
                return await addDoc(collection(db, "enfants"), childData);
            });
            const childrenIds = await Promise.all(childrenPromises);
            const grossesseUpdate = {
                statut: "Terminée",
            };
            await updateDoc(doc(db, "grossesses", grossesseId), grossesseUpdate);
            return { success: true, grossesseId: grossesseId, accouchementId: accouchementDocRef.id, childrenIds };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const getPatientsWithDetails = async () => {
        try {
            setLoading(true);
            
            // Get all patients
            const patientsSnapshot = await getDocs(collection(db, "patientes"));
            const patientsWithDetails = [];
            
            for (const patientDoc of patientsSnapshot.docs) {
                const patientData = { id: patientDoc.id, ...patientDoc.data() };
                
                // Get person details
                const personneDoc = await getDoc(doc(db, "personnes", patientData.personneId));
                const personneData = personneDoc.exists() ? personneDoc.data() : {};
                
                // Get dossier
                const dossiersQuery = query(
                    collection(db, "dossiers"), 
                    where("patientId", "==", patientDoc.id)
                );
                const dossiersSnapshot = await getDocs(dossiersQuery);
                
                let latestCpnRdv = null;
                
                if (!dossiersSnapshot.empty) {
                    const dossierId = dossiersSnapshot.docs[0].id;
                    
                    // Get active pregnancy for this dossier
                    const grossessesQuery = query(
                        collection(db, "grossesses"),
                        where("dossierId", "==", dossierId),
                        where("statut", "==", "En cours")
                    );
                    const grossessesSnapshot = await getDocs(grossessesQuery);
                    
                    if (!grossessesSnapshot.empty) {
                        const grossesseId = grossessesSnapshot.docs[0].id;
                        
                        // Get latest CPN consultation for this pregnancy
                        const cpnsQuery = query(
                            collection(db, "cpns"),
                            where("grossesseId", "==", grossesseId),
                            orderBy("createdAt", "desc"),
                            fsLimit(1)
                        );
                        const cpnsSnapshot = await getDocs(cpnsQuery);
                        
                        if (!cpnsSnapshot.empty) {
                            const cpnData = cpnsSnapshot.docs[0].data();
                            
                            // Get the consultation details to get the RDV
                            const consultationDoc = await getDoc(doc(db, "consultations", cpnData.consultationId));
                            if (consultationDoc.exists()) {
                                const consultationData = consultationDoc.data();
                                latestCpnRdv = consultationData.rdv;
                            }
                        }
                    }
                }
                
                // Combine all data
                const patientWithDetails = {
                    id: patientDoc.id,
                    ...personneData,
                    prochainRdv: latestCpnRdv,
                    patientId: patientDoc.id,
                    personneId: patientData.personneId
                };
                
                patientsWithDetails.push(patientWithDetails);
            }
            
            setLoading(false);
            return { success: true, patients: patientsWithDetails };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getPatientStats = async () => {
        try {
            setLoading(true);
            
            // Get total number of patients
            const patientsSnapshot = await getDocs(collection(db, "patientes"));
            const totalPatients = patientsSnapshot.size;
            
            // Get active pregnancies
            const activePregnanciesQuery = query(
                collection(db, "grossesses"),
                where("statut", "==", "En cours")
            );
            const activePregnanciesSnapshot = await getDocs(activePregnanciesQuery);
            const activePregnancies = activePregnanciesSnapshot.size;
            
            // Get completed pregnancies
            const completedPregnanciesQuery = query(
                collection(db, "grossesses"),
                where("statut", "==", "Terminée")
            );
            const completedPregnanciesSnapshot = await getDocs(completedPregnanciesQuery);
            const completedPregnancies = completedPregnanciesSnapshot.size;
            
            // Get upcoming CPN appointments (RDV in the next 7 days)
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            
            const todayStr = today.toISOString().split('T')[0];
            const nextWeekStr = nextWeek.toISOString().split('T')[0];
            
            const upcomingRdvQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN"),
                where("rdv", ">=", todayStr),
                where("rdv", "<=", nextWeekStr)
            );
            const upcomingRdvSnapshot = await getDocs(upcomingRdvQuery);
            const upcomingAppointments = upcomingRdvSnapshot.size;
            
            // Get total CPN consultations this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            
            const cpnThisMonthQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN"),
                where("dateConsultation", ">=", Timestamp.fromDate(currentMonth))
            );
            const cpnThisMonthSnapshot = await getDocs(cpnThisMonthQuery);
            const cpnThisMonth = cpnThisMonthSnapshot.size;
            
            const stats = {
                totalPatients,
                activePregnancies,
                completedPregnancies,
                upcomingAppointments,
                cpnThisMonth,
                totalPregnancies: activePregnancies + completedPregnancies
            };
            
            setLoading(false);
            return { success: true, stats };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getCpnConsultations = async () => {
        try {
            setLoading(true);
            
            const today = new Date().toISOString().split('T')[0];
            const cpnConsultations = [];
            
            // Get all CPN consultations with RDV dates
            const consultationsQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN"),
                where("rdv", "!=", null)
            );
            const consultationsSnapshot = await getDocs(consultationsQuery);
            
            for (const consultationDoc of consultationsSnapshot.docs) {
                const consultationData = { id: consultationDoc.id, ...consultationDoc.data() };
                const rdvDate = consultationData.rdv;
                
                // Check if CPN was already done for this consultation
                const cpnQuery = query(
                    collection(db, "cpns"),
                    where("consultationId", "==", consultationDoc.id)
                );
                const cpnSnapshot = await getDocs(cpnQuery);
                const cpnAlreadyDone = !cpnSnapshot.empty;
                
                // Determine status
                let status;
                if (cpnAlreadyDone) {
                    status = "Terminé"; // CPN was completed
                } else if (rdvDate === today) {
                    status = "En attente"; // RDV is today but CPN not done yet
                } else if (rdvDate > today) {
                    status = "Planifié"; // RDV is in the future
                } else {
                    continue; // Skip past appointments that were not completed
                }
                
                // Get grossesse information to find patient
                let patientInfo = null;
                if (cpnSnapshot.docs.length > 0) {
                    const cpnData = cpnSnapshot.docs[0].data();
                    const grossesseId = cpnData.grossesseId;
                    
                    // Get grossesse to find dossier
                    const grossesseDoc = await getDoc(doc(db, "grossesses", grossesseId));
                    if (grossesseDoc.exists()) {
                        const grossesseData = grossesseDoc.data();
                        const dossierId = grossesseData.dossierId;
                        
                        // Get dossier to find patient
                        const dossierDoc = await getDoc(doc(db, "dossiers", dossierId));
                        if (dossierDoc.exists()) {
                            const dossierData = dossierDoc.data();
                            const patientId = dossierData.patientId;
                            
                            // Get patient to find person
                            const patientDoc = await getDoc(doc(db, "patientes", patientId));
                            if (patientDoc.exists()) {
                                const patientData = patientDoc.data();
                                const personneId = patientData.personneId;
                                
                                // Get person details
                                const personneDoc = await getDoc(doc(db, "personnes", personneId));
                                if (personneDoc.exists()) {
                                    const personneData = personneDoc.data();
                                    patientInfo = {
                                        patientId,
                                        personneId,
                                        ...personneData
                                    };
                                }
                            }
                        }
                    }
                } else {
                    // For consultations without CPN done yet, we need to find the patient differently
                    // We'll look for active pregnancies and match by consultation userId or other means
                    // This is a fallback approach - in practice, you might want to store patientId in consultations
                    
                    // Get all active pregnancies
                    const activePregnanciesQuery = query(
                        collection(db, "grossesses"),
                        where("statut", "==", "En cours")
                    );
                    const activePregnanciesSnapshot = await getDocs(activePregnanciesQuery);
                    
                    // For each active pregnancy, check if it matches this consultation
                    for (const grossesseDoc of activePregnanciesSnapshot.docs) {
                        const grossesseData = grossesseDoc.data();
                        const dossierId = grossesseData.dossierId;
                        
                        // Get dossier to find patient
                        const dossierDoc = await getDoc(doc(db, "dossiers", dossierId));
                        if (dossierDoc.exists()) {
                            const dossierData = dossierDoc.data();
                            const patientId = dossierData.patientId;
                            
                            // Get patient to find person
                            const patientDoc = await getDoc(doc(db, "patientes", patientId));
                            if (patientDoc.exists()) {
                                const patientData = patientDoc.data();
                                const personneId = patientData.personneId;
                                
                                // Get person details
                                const personneDoc = await getDoc(doc(db, "personnes", personneId));
                                if (personneDoc.exists()) {
                                    const personneData = personneDoc.data();
                                    patientInfo = {
                                        patientId,
                                        personneId,
                                        grossesseId: grossesseDoc.id,
                                        ...personneData
                                    };
                                    break; // Found a match, exit loop
                                }
                            }
                        }
                    }
                }
                
                if (patientInfo) {
                    const cpnConsultation = {
                        id: consultationDoc.id,
                        rdv: rdvDate,
                        status,
                        diagnostique: consultationData.diagnostique,
                        dateConsultation: consultationData.dateConsultation,
                        userId: consultationData.userId,
                        patient: patientInfo,
                        cpnDone: cpnAlreadyDone
                    };
                    
                    cpnConsultations.push(cpnConsultation);
                }
            }
            
            // Sort by RDV date
            cpnConsultations.sort((a, b) => a.rdv.localeCompare(b.rdv));
            
            setLoading(false);
            return { success: true, cpnConsultations };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getCpnStats = async () => {
        try {
            setLoading(true);
            
            const today = new Date().toISOString().split('T')[0];
            
            // Get all CPN consultations
            const consultationsQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN"),
                where("rdv", "!=", null)
            );
            const consultationsSnapshot = await getDocs(consultationsQuery);
            const totalCpnConsultations = consultationsSnapshot.size;
            
            let completedCpns = 0;
            let pendingCpns = 0;
            let plannedCpns = 0;
            let overdueCpns = 0;
            
            for (const consultationDoc of consultationsSnapshot.docs) {
                const consultationData = consultationDoc.data();
                const rdvDate = consultationData.rdv;
                
                // Check if CPN was already done for this consultation
                const cpnQuery = query(
                    collection(db, "cpns"),
                    where("consultationId", "==", consultationDoc.id)
                );
                const cpnSnapshot = await getDocs(cpnQuery);
                const cpnAlreadyDone = !cpnSnapshot.empty;
                
                if (cpnAlreadyDone) {
                    completedCpns++;
                } else if (rdvDate === today) {
                    pendingCpns++;
                } else if (rdvDate > today) {
                    plannedCpns++;
                } else if (rdvDate < today) {
                    overdueCpns++;
                }
            }
            
            // Get CPN consultations this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            
            const cpnThisMonthQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN"),
                where("dateConsultation", ">=", Timestamp.fromDate(currentMonth))
            );
            const cpnThisMonthSnapshot = await getDocs(cpnThisMonthQuery);
            const cpnThisMonth = cpnThisMonthSnapshot.size;
            
            // Get completed CPNs this month
            let completedCpnThisMonth = 0;
            for (const consultationDoc of cpnThisMonthSnapshot.docs) {
                const cpnQuery = query(
                    collection(db, "cpns"),
                    where("consultationId", "==", consultationDoc.id)
                );
                const cpnSnapshot = await getDocs(cpnQuery);
                if (!cpnSnapshot.empty) {
                    completedCpnThisMonth++;
                }
            }
            
            const stats = {
                totalCpnConsultations,
                completedCpns,
                pendingCpns,
                plannedCpns,
                overdueCpns,
                cpnThisMonth,
                completedCpnThisMonth,
                completionRate: totalCpnConsultations > 0 ? Math.round((completedCpns / totalCpnConsultations) * 100) : 0
            };
            
            setLoading(false);
            return { success: true, stats };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getAccouchements = async () => {
        try {
            setLoading(true);
            
            // Get all accouchements
            const accouchementsSnapshot = await getDocs(collection(db, "accouchements"));
            const accouchementsWithDetails = [];
            
            for (const accouchementDoc of accouchementsSnapshot.docs) {
                const accouchementData = { id: accouchementDoc.id, ...accouchementDoc.data() };
                
                // Get children for this accouchement
                const enfantsQuery = query(
                    collection(db, "enfants"),
                    where("accouchementId", "==", accouchementDoc.id)
                );
                const enfantsSnapshot = await getDocs(enfantsQuery);
                const enfants = enfantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Get patient information via grossesse
                let patientInfo = null;
                const grossesseId = accouchementData.grossesseId;
                
                if (grossesseId) {
                    // Get grossesse to find dossier
                    const grossesseDoc = await getDoc(doc(db, "grossesses", grossesseId));
                    if (grossesseDoc.exists()) {
                        const grossesseData = grossesseDoc.data();
                        const dossierId = grossesseData.dossierId;
                        
                        // Get dossier to find patient
                        const dossierDoc = await getDoc(doc(db, "dossiers", dossierId));
                        if (dossierDoc.exists()) {
                            const dossierData = dossierDoc.data();
                            const patientId = dossierData.patientId;
                            
                            // Get patient to find person
                            const patientDoc = await getDoc(doc(db, "patientes", patientId));
                            if (patientDoc.exists()) {
                                const patientData = patientDoc.data();
                                const personneId = patientData.personneId;
                                
                                // Get person details
                                const personneDoc = await getDoc(doc(db, "personnes", personneId));
                                if (personneDoc.exists()) {
                                    const personneData = personneDoc.data();
                                    patientInfo = {
                                        patientId,
                                        personneId,
                                        grossesseId,
                                        dossierId,
                                        ...personneData
                                    };
                                }
                            }
                        }
                    }
                }
                
                if (patientInfo) {
                    const accouchementWithDetails = {
                        id: accouchementDoc.id,
                        nomMari: accouchementData.nomMari,
                        prenomMari: accouchementData.prenomMari,
                        heureAdmission: accouchementData.heureAdmission,
                        dateAdmission: accouchementData.dateAdmission,
                        heureAccouchement: accouchementData.heureAccouchement,
                        dateAccouchement: accouchementData.dateAccouchement,
                        modeAccouchement: accouchementData.modeAccouchement,
                        note: accouchementData.note,
                        grossesseId: accouchementData.grossesseId,
                        createdAt: accouchementData.createdAt,
                        enfants: enfants,
                        patient: patientInfo
                    };
                    
                    accouchementsWithDetails.push(accouchementWithDetails);
                }
            }
            
            // Sort by date of accouchement (most recent first)
            accouchementsWithDetails.sort((a, b) => {
                const dateA = new Date(a.dateAccouchement);
                const dateB = new Date(b.dateAccouchement);
                return dateB - dateA;
            });
            
            setLoading(false);
            return { success: true, accouchements: accouchementsWithDetails };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getAccouchementStats = async () => {
        try {
            setLoading(true);
            
            // Get all accouchements
            const accouchementsSnapshot = await getDocs(collection(db, "accouchements"));
            const totalAccouchements = accouchementsSnapshot.size;
            
            // Get accouchements this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            
            const accouchementsThisMonthQuery = query(
                collection(db, "accouchements"),
                where("createdAt", ">=", Timestamp.fromDate(currentMonth))
            );
            const accouchementsThisMonthSnapshot = await getDocs(accouchementsThisMonthQuery);
            const accouchementsThisMonth = accouchementsThisMonthSnapshot.size;
            
            // Count by mode of delivery
            let voieBasse = 0;
            let cesarienne = 0;
            
            // Count children by gender
            let totalEnfants = 0;
            let enfantsMasculins = 0;
            let enfantsFeminins = 0;
            
            for (const accouchementDoc of accouchementsSnapshot.docs) {
                const accouchementData = accouchementDoc.data();
                const modeAccouchement = accouchementData.modeAccouchement?.toLowerCase() || '';
                
                // Count by delivery mode
                if (modeAccouchement.includes('voie basse') || modeAccouchement.includes('naturel')) {
                    voieBasse++;
                } else if (modeAccouchement.includes('césarienne') || modeAccouchement.includes('cesarienne')) {
                    cesarienne++;
                }
                
                // Get children for this accouchement
                const enfantsQuery = query(
                    collection(db, "enfants"),
                    where("accouchementId", "==", accouchementDoc.id)
                );
                const enfantsSnapshot = await getDocs(enfantsQuery);
                
                totalEnfants += enfantsSnapshot.size;
                
                enfantsSnapshot.docs.forEach(enfantDoc => {
                    const enfantData = enfantDoc.data();
                    const sexe = enfantData.sexeEnfant?.toLowerCase() || '';
                    
                    if (sexe.includes('masculin') || sexe.includes('garçon') || sexe === 'm') {
                        enfantsMasculins++;
                    } else if (sexe.includes('féminin') || sexe.includes('fille') || sexe === 'f') {
                        enfantsFeminins++;
                    }
                });
            }
            
            // Calculate averages
            const moyenneEnfantsParAccouchement = totalAccouchements > 0 ? 
                Math.round((totalEnfants / totalAccouchements) * 100) / 100 : 0;
            
            const stats = {
                totalAccouchements,
                accouchementsThisMonth,
                totalEnfants,
                enfantsMasculins,
                enfantsFeminins,
                moyenneEnfantsParAccouchement,
                modesAccouchement: {
                    voieBasse,
                    cesarienne,
                },
                tauxCesarienne: totalAccouchements > 0 ? 
                    Math.round((cesarienne / totalAccouchements) * 100) : 0
            };
            
            setLoading(false);
            return { success: true, stats };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const updatePatient = async (patientId, personneId, updatedData) => {
        try {
            setLoading(true);
            
            // Update person data
            const personneData = {
                nom: updatedData.nom,
                prenom: updatedData.prenom,
                age: updatedData.age,
                telephone: updatedData.telephone,
                adresse: updatedData.adresse,
                updatedAt: Timestamp.now(),
            };
            
            await updateDoc(doc(db, "personnes", personneId), personneData);
            setLoading(false);
            return { success: true, patientId, personneId };
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    // Récupérer les détails d'une patiente par ID (pour la page de détail)
    const getPatientDetails = async (patientId) => {
        try {
            setLoading(true);

            // Patient de base
            const patientSnap = await getDoc(doc(db, "patientes", patientId));
            if (!patientSnap.exists()) {
                setLoading(false);
                return { success: false, error: new Error('Patiente introuvable') };
            }
            const patientData = patientSnap.data();
            const personneId = patientData.personneId;

            // Informations de la personne
            let personneData = {};
            if (personneId) {
                const personneSnap = await getDoc(doc(db, "personnes", personneId));
                if (personneSnap.exists()) {
                    personneData = personneSnap.data();
                }
            }

            // Dossier de la patiente
            const dossiersSnapshot = await getDocs(query(
                collection(db, "dossiers"),
                where("patientId", "==", patientId)
            ));
            let dossierId = null;
            if (!dossiersSnapshot.empty) {
                dossierId = dossiersSnapshot.docs[0].id;
            }

            // Grossesses liées au dossier
            let currentGrossesse = null;
            let completedGrossesses = [];
            if (dossierId) {
                const grossessesSnapshot = await getDocs(query(
                    collection(db, "grossesses"),
                    where("dossierId", "==", dossierId)
                ));
                for (const g of grossessesSnapshot.docs) {
                    const gData = { id: g.id, ...g.data() };
                    if (gData.statut === "En cours" && !currentGrossesse) currentGrossesse = gData;
                    if (gData.statut === "Terminée") completedGrossesses.push(gData);
                }
            }

            // Dernière CPN et prochain RDV
            let lastVisit = null;
            let nextVisit = null;
            let cpnsCount = 0;
            if (currentGrossesse) {
                const cpnsSnapshot = await getDocs(query(
                    collection(db, "cpns"),
                    where("grossesseId", "==", currentGrossesse.id),
                    orderBy("createdAt", "desc")
                ));
                cpnsCount = cpnsSnapshot.size;
                if (!cpnsSnapshot.empty) {
                    const lastCpn = cpnsSnapshot.docs[0].data();
                    if (lastCpn.consultationId) {
                        const cSnap = await getDoc(doc(db, "consultations", lastCpn.consultationId));
                        if (cSnap.exists()) {
                            const cData = cSnap.data();
                            lastVisit = cData.dateConsultation?.toDate ? cData.dateConsultation.toDate().toISOString() : (cData.dateConsultation || lastCpn.createdAt?.toDate?.().toISOString() || null);
                            nextVisit = cData.rdv || null;
                        }
                    } else {
                        lastVisit = lastCpn.createdAt?.toDate?.().toISOString() || null;
                    }
                }
            }

            // Accouchements liés à la grossesse courante (si existante)
            let accouchementsCount = 0;
            if (currentGrossesse) {
                const accouchementsSnapshot = await getDocs(query(
                    collection(db, "accouchements"),
                    where("grossesseId", "==", currentGrossesse.id)
                ));
                accouchementsCount = accouchementsSnapshot.size;
            }

            const patient = {
                id: patientId,
                patientId,
                personneId,
                ...personneData,
                name: `${personneData?.prenom || ''} ${personneData?.nom || ''}`.trim(),
                age: personneData?.age ?? null,
                phone: personneData?.telephone || null,
                adresse: personneData?.adresse || null,
                nextVisit: nextVisit,
                prochainRdv: nextVisit,
                lastVisit,
                status: currentGrossesse ? "Normal" : (completedGrossesses.length > 0 ? "Post-partum" : "Normal"),
                gestationalAge: "À renseigner",
                dossierId,
                currentGrossesseId: currentGrossesse?.id || null,
                currentGrossesseStatut: currentGrossesse?.statut || null,
                cpnsCount,
                accouchementsCount,
            };

            setLoading(false);
            return { success: true, patient };
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    return { patientes, loading, error, addPatient, updatePatient, addPregnancy, addCpn, addChildbirth, getPatientsWithDetails, getPatientStats, getCpnConsultations, getCpnStats, getAccouchements, getAccouchementStats, getPatientDetails };
}