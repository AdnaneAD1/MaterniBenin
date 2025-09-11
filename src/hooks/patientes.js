"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "./auth";
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
import {
    generatePatientId,
    generateDossierMedicalId,
    generateAccouchementId,
    generateCpnId,
    generateEnfantId,
    generateGrossesseId
} from "@/utils/idGenerator";

export function usePatiente() {
    const [patientes, setPatientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

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
            
            // Générer un ID personnalisé pour la patiente
            const patientId = await generatePatientId();
            const patientData = {
                personneId: personneRef.id,
                createdAt: Timestamp.now(),
            }
            await setDoc(doc(db, "patientes", patientId), patientData);
            
            // Générer un ID personnalisé pour le dossier médical
            const dossierId = await generateDossierMedicalId();
            const dossierRef = {
                patientId: patientId,
                createdAt: Timestamp.now(),
            };
            await setDoc(doc(db, "dossiers", dossierId), dossierRef);
            
            return { success: true, patientId: patientId, dossierId: dossierId, personneId: personneRef.id };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const addPregnancy = async (dossierId, pregnancyData = {}) => {
        try {
            // Générer un ID personnalisé pour la grossesse
            const grossesseId = await generateGrossesseId();
            
            const grossesseData = {
                statut: "En cours",
                dossierId: dossierId,
                moisGrossesse: pregnancyData.moisGrossesse || null,
                createdAt: Timestamp.now(),
            };
            
            await setDoc(doc(db, "grossesses", grossesseId), grossesseData);
            return { success: true, dossierId: dossierId, grossesseId: grossesseId };
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
            
            // Générer un ID personnalisé pour la CPN
            const cpnId = await generateCpnId();
            const cpnData = {
                cpn: "CPN " + (allcpn.docs.length + 1),
                dormirsurmild: cpn.dormirsurmild,
                sulfadoxine: cpn.sulphadoxine,
                mebendazole: cpn.mebendazole,
                ferfoldine: cpn.ferfoldine,
                vat: cpn.vat,
                garedepiste: cpn.gare_depiste,
                garerefere: cpn.garere_fere,
                conduiteTenue: cpn.conduiteTenue,
                grossesseId: grossesseId,
                consultationId: conRef.id,
                createdAt: Timestamp.now(),
            };
            await setDoc(doc(db, "cpns", cpnId), cpnData);
            
            return { success: true, grossesseId: grossesseId, cpnId: cpnId };
        } catch (error) {
            setError(error);
            return { success: false, error };
        }
    };

    const addChildbirth = async (grossesseId, childbirth) => {
        try {
            // Générer un ID personnalisé pour l'accouchement
            const accouchementId = await generateAccouchementId();
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
            await setDoc(doc(db, "accouchements", accouchementId), accouchementData);
            
            // Créer les enfants avec des IDs personnalisés
            const childrenPromises = childbirth.enfants.map(async (enfant) => {
                const enfantId = await generateEnfantId();
                const childData = {
                    nomEnfant: enfant.nomEnfant,
                    prenomEnfant: enfant.prenomEnfant,
                    sexeEnfant: enfant.sexe,
                    poids: enfant.poids,
                    accouchementId: accouchementId,
                    createdAt: Timestamp.now(),
                };
                await setDoc(doc(db, "enfants", enfantId), childData);
                return enfantId;
            });
            const childrenIds = await Promise.all(childrenPromises);
            
            const grossesseUpdate = {
                statut: "Terminée",
            };
            await updateDoc(doc(db, "grossesses", grossesseId), grossesseUpdate);
            return { success: true, grossesseId: grossesseId, accouchementId: accouchementId, childrenIds };
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
                
                // Calculer les mois de grossesse actuels
                let moisGrossesseActuel = "Aucun";
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
                        const grossesseData = grossessesSnapshot.docs[0].data();
                        
                        if (grossesseData.moisGrossesse && grossesseData.createdAt) {
                            const dateCreation = grossesseData.createdAt.toDate();
                            const maintenant = new Date();
                            const moisEcoules = Math.floor((maintenant - dateCreation) / (1000 * 60 * 60 * 24 * 30.44)); // Approximation d'un mois
                            const moisTotal = parseInt(grossesseData.moisGrossesse) + moisEcoules;
                            
                            // Limiter à 9 mois maximum
                            if (moisTotal <= 9 && moisTotal > 0) {
                                moisGrossesseActuel = `${moisTotal} mois`;
                            } else if (moisTotal > 9) {
                                moisGrossesseActuel = "9+ mois";
                            }
                        }
                    }
                }

                // Combine all data
                const patientWithDetails = {
                    id: patientDoc.id,
                    ...personneData,
                    prochainRdv: latestCpnRdv,
                    moisGrossesseActuel: moisGrossesseActuel,
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
            const cpnConsultations = [];
            const today = new Date();
            
            // 1. Get all completed CPN records from cpns collection
            const cpnsQuery = query(collection(db, "cpns"));
            const cpnsSnapshot = await getDocs(cpnsQuery);
            
            for (const cpnDoc of cpnsSnapshot.docs) {
                const cpnData = { id: cpnDoc.id, ...cpnDoc.data() };
                const grossesseId = cpnData.grossesseId;
                
                // Get grossesse to find dossier
                const grossesseDoc = await getDoc(doc(db, "grossesses", grossesseId));
                if (!grossesseDoc.exists()) continue;
                
                const grossesseData = grossesseDoc.data();
                const dossierId = grossesseData.dossierId;
                
                // Get dossier to find patient
                const dossierDoc = await getDoc(doc(db, "dossiers", dossierId));
                if (!dossierDoc.exists()) continue;
                
                const dossierData = dossierDoc.data();
                const patientId = dossierData.patientId;
                
                // Get patient to find person
                const patientDoc = await getDoc(doc(db, "patientes", patientId));
                if (!patientDoc.exists()) continue;
                
                const patientData = patientDoc.data();
                const personneId = patientData.personneId;
                
                // Get person details
                const personneDoc = await getDoc(doc(db, "personnes", personneId));
                if (!personneDoc.exists()) continue;
                
                const personneData = personneDoc.data();
                
                // Get consultation details if available
                let consultationData = null;
                if (cpnData.consultationId) {
                    const consultationDoc = await getDoc(doc(db, "consultations", cpnData.consultationId));
                    if (consultationDoc.exists()) {
                        consultationData = consultationDoc.data();
                    }
                }
                
                // Calculer l'âge gestationnel
                let moisGrossesseActuel = "Non défini";
                if (grossesseData.moisGrossesse && grossesseData.createdAt) {
                    const dateCreation = grossesseData.createdAt.toDate();
                    const maintenant = new Date();
                    const moisEcoules = Math.floor((maintenant - dateCreation) / (1000 * 60 * 60 * 24 * 30.44)); // Approximation d'un mois
                    const moisTotal = parseInt(grossesseData.moisGrossesse) + moisEcoules;
                    
                    // Limiter à 9 mois maximum
                    if (moisTotal <= 9 && moisTotal > 0) {
                        moisGrossesseActuel = `${moisTotal} mois`;
                    } else if (moisTotal > 9) {
                        moisGrossesseActuel = "9+ mois";
                    }
                }
                
                // Déterminer le statut correct de la consultation
                let consultationStatus = "Terminé";
                if (consultationData) {
                    consultationStatus = consultationData.statut || "Terminé";
                }
                
                const patientInfo = {
                    patientId,
                    personneId,
                    ...personneData
                };
                
                cpnConsultations.push({
                    id: cpnData.id,
                    patient: patientInfo,
                    rdv: consultationData?.rdv || null,
                    visitNumber: cpnData?.cpn || null,
                    status: consultationStatus,
                    diagnostique: cpnData.diagnostiqueAssocie || consultationData?.diagnostique || '',
                    dateConsultation: consultationData?.dateConsultation || cpnData.createdAt,
                    userId: cpnData.userId || consultationData?.userId,
                    cpnDone: true,
                    consultationId: cpnData.consultationId,
                    ageGestationnel: moisGrossesseActuel,
                    // Toutes les informations CPN
                    dateConsultationCpn: cpnData.dateConsultation,
                    dormirsurmild: cpnData.dormirsurmild || false,
                    spNbr: cpnData.sulfadoxine || '',
                    mebendazole: cpnData.mebendazole || '',
                    ferFoldine: cpnData.ferfoldine || '',
                    vat: cpnData.vat || '',
                    gareDepiste: cpnData.garedepiste || false,
                    gareRefere: cpnData.garerefere || false,
                    conduiteTenue: cpnData.conduiteTenue || '',
                    grossesseId: grossesseId
                });
            }
            
            // 2. Récupérer toutes les consultations CPN (sans restriction de grossesse)
            const allConsultationsQuery = query(
                collection(db, "consultations"),
                where("type", "==", "CPN")
            );
            const allConsultationsSnapshot = await getDocs(allConsultationsQuery);
            
            console.log(`Total consultations CPN trouvées: ${allConsultationsSnapshot.docs.length}`);
            
            for (const consultationDoc of allConsultationsSnapshot.docs) {
                const consultationData = { id: consultationDoc.id, ...consultationDoc.data() };
                
                console.log('Consultation CPN data:', consultationData);
                console.log('RDV de cette consultation:', consultationData.rdv);
                
                // Vérifier si cette consultation a déjà une CPN terminée
                const existingCpn = cpnConsultations.find(cpn => cpn.consultationId === consultationDoc.id);
                if (existingCpn) {
                    console.log('Consultation déjà traitée, skip');
                    continue;
                }
                
                // Récupérer les informations de la patiente via la consultation ou CPN
                let patientInfo = null;
                let moisGrossesseActuel = "Non défini";
                let grossesseId = consultationData.grossesseId;
                
                // Essayer de récupérer les infos via userId de la consultation
                if (consultationData.userId) {
                    try {
                        // Chercher une CPN existante avec ce userId pour récupérer les infos
                        const cpnQuery = query(
                            collection(db, "cpns"),
                            where("userId", "==", consultationData.userId),
                            fsLimit(1)
                        );
                        const cpnSnapshot = await getDocs(cpnQuery);
                        
                        if (!cpnSnapshot.empty) {
                            const cpnData = cpnSnapshot.docs[0].data();
                            grossesseId = cpnData.grossesseId;
                            console.log('Grossesse trouvée via CPN existante:', grossesseId);
                        }
                    } catch (error) {
                        console.log('Erreur lors de la recherche CPN:', error);
                    }
                }
                
                // Si toujours pas de grossesseId, chercher via les grossesses actives
                if (!grossesseId) {
                    try {
                        const grossessesQuery = query(
                            collection(db, "grossesses"),
                            where("statut", "==", "En cours"),
                            fsLimit(1)
                        );
                        const grossessesSnapshot = await getDocs(grossessesQuery);
                        
                        if (!grossessesSnapshot.empty) {
                            grossesseId = grossessesSnapshot.docs[0].id;
                            console.log('Grossesse active trouvée:', grossesseId);
                        }
                    } catch (error) {
                        console.log('Erreur lors de la recherche grossesse active:', error);
                    }
                }
                
                // Maintenant traiter avec le grossesseId trouvé
                let grossesseData = null;
                
                if (grossesseId) {
                    // Si grossesseId existe, récupérer les infos complètes
                    const grossesseDoc = await getDoc(doc(db, "grossesses", grossesseId));
                    if (!grossesseDoc.exists()) {
                        console.log('Grossesse introuvable, skip');
                        continue;
                    }
                    
                    grossesseData = grossesseDoc.data();
                    const dossierId = grossesseData.dossierId;
                    
                    // Get dossier to find patient
                    const dossierDoc = await getDoc(doc(db, "dossiers", dossierId));
                    if (!dossierDoc.exists()) continue;
                    
                    const dossierData = dossierDoc.data();
                    const patientId = dossierData.patientId;
                    
                    // Get patient to find person
                    const patientDoc = await getDoc(doc(db, "patientes", patientId));
                    if (!patientDoc.exists()) continue;
                    
                    const patientData = patientDoc.data();
                    const personneId = patientData.personneId;
                    
                    // Get person details
                    const personneDoc = await getDoc(doc(db, "personnes", personneId));
                    if (!personneDoc.exists()) continue;
                    
                    const personneData = personneDoc.data();
                    
                    patientInfo = {
                        patientId,
                        personneId,
                        ...personneData
                    };
                    
                    // Calculer l'âge gestationnel
                    if (grossesseData.moisGrossesse && grossesseData.createdAt) {
                        const dateCreation = grossesseData.createdAt.toDate();
                        const maintenant = new Date();
                        const moisEcoules = Math.floor((maintenant - dateCreation) / (1000 * 60 * 60 * 24 * 30.44));
                        const moisTotal = parseInt(grossesseData.moisGrossesse) + moisEcoules;
                        
                        if (moisTotal <= 9 && moisTotal > 0) {
                            moisGrossesseActuel = `${moisTotal} mois`;
                        } else if (moisTotal > 9) {
                            moisGrossesseActuel = "9+ mois";
                        }
                    }
                    
                    console.log('Informations patiente récupérées:', patientInfo);
                } else {
                    // Si pas de grossesseId trouvé, essayer de récupérer via userId
                    console.log('Tentative de récupération patiente via userId:', consultationData.userId);
                    
                    if (consultationData.userId) {
                        try {
                            // Chercher directement dans les personnes via userId (si lié)
                            const personnesQuery = query(collection(db, "personnes"));
                            const personnesSnapshot = await getDocs(personnesQuery);
                            
                            for (const personneDoc of personnesSnapshot.docs) {
                                const personneData = personneDoc.data();
                                // Chercher une patiente liée à cette personne
                                const patientesQuery = query(
                                    collection(db, "patientes"),
                                    where("personneId", "==", personneDoc.id)
                                );
                                const patientesSnapshot = await getDocs(patientesQuery);
                                
                                if (!patientesSnapshot.empty) {
                                    const patientData = patientesSnapshot.docs[0].data();
                                    patientInfo = {
                                        patientId: patientesSnapshot.docs[0].id,
                                        personneId: personneDoc.id,
                                        ...personneData
                                    };
                                    console.log('Patiente trouvée via recherche:', patientInfo);
                                    break;
                                }
                            }
                        } catch (error) {
                            console.log('Erreur recherche patiente:', error);
                        }
                    }
                    
                    // Si toujours pas trouvé, créer patiente virtuelle
                    if (!patientInfo) {
                        console.log('Aucune patiente trouvée, création patiente virtuelle');
                        patientInfo = {
                            patientId: `virtual-patient-${consultationDoc.id}`,
                            personneId: `virtual-personne-${consultationDoc.id}`,
                            nom: 'Patiente',
                            prenom: 'Inconnue',
                            age: 'N/A',
                            telephone: 'N/A',
                            adresse: 'N/A'
                        };
                    }
                }
                
                // Déterminer le statut basé uniquement sur la date RDV
                let status = "Planifié";
                const rdvDate = consultationData.rdv;
                
                if (rdvDate) {
                    // Convertir la date RDV en objet Date
                    const rdv = rdvDate.toDate ? rdvDate.toDate() : new Date(rdvDate);
                    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const rdvStart = new Date(rdv.getFullYear(), rdv.getMonth(), rdv.getDate());
                    
                    console.log('Date RDV:', rdv);
                    console.log('Date aujourd\'hui:', todayStart);
                    console.log('Comparaison:', rdvStart.getTime(), 'vs', todayStart.getTime());
                    
                    if (rdvStart.getTime() === todayStart.getTime()) {
                        status = "En attente"; // RDV aujourd'hui
                        console.log('Statut: En attente (RDV aujourd\'hui)');
                    } else if (rdvStart.getTime() > todayStart.getTime()) {
                        status = "Planifié"; // RDV futur
                        console.log('Statut: Planifié (RDV futur)');
                    }
                    // Si RDV passé, on ne crée pas de CPN virtuelle
                    else {
                        console.log('RDV passé, skip cette consultation');
                    }
                }
            }
            
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
            
            // Get all CPN records directly
            const cpnsQuery = query(collection(db, "cpns"));
            const cpnsSnapshot = await getDocs(cpnsQuery);
            const totalCpnConsultations = cpnsSnapshot.size;
            
            // All CPNs in the collection are completed by definition
            const completedCpns = totalCpnConsultations;
            const pendingCpns = 0;
            const plannedCpns = 0;
            const overdueCpns = 0;
            
            // Get CPN consultations this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            
            const cpnThisMonthQuery = query(
                collection(db, "cpns"),
                where("createdAt", ">=", Timestamp.fromDate(currentMonth))
            );
            const cpnThisMonthSnapshot = await getDocs(cpnThisMonthQuery);
            const cpnThisMonth = cpnThisMonthSnapshot.size;
            const completedCpnThisMonth = cpnThisMonth; // All CPNs in collection are completed
            
            const stats = {
                totalCpnConsultations,
                completedCpns,
                pendingCpns,
                plannedCpns,
                overdueCpns,
                cpnThisMonth,
                completedCpnThisMonth
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