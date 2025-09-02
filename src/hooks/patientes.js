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

    return { patientes, loading, error, addPatient, addPregnancy, addCpn, addChildbirth };
}