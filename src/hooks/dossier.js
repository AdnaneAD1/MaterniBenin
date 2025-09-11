"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export function useDossier() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer les détails d'un dossier maternité avec ses grossesses et compteurs
  const getDossierDetails = async (patientId, dossierId) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier dossier
      const dossierSnap = await getDoc(doc(db, "dossiers", dossierId));
      if (!dossierSnap.exists()) {
        setLoading(false);
        return { success: false, error: new Error("Dossier introuvable") };
      }
      const dossierData = dossierSnap.data();
      if (dossierData.patientId !== patientId) {
        setLoading(false);
        return { success: false, error: new Error("Dossier non associé à cette patiente") };
      }

      // Récupérer infos patiente -> personne
      const patientSnap = await getDoc(doc(db, "patientes", patientId));
      if (!patientSnap.exists()) {
        setLoading(false);
        return { success: false, error: new Error("Patiente introuvable") };
      }
      const patientData = patientSnap.data();
      const personneId = patientData.personneId;

      let identite = { nom: "", prenom: "", age: null, telephone: null };
      if (personneId) {
        const personneSnap = await getDoc(doc(db, "personnes", personneId));
        if (personneSnap.exists()) {
          const p = personneSnap.data();
          identite = {
            nom: p.nom || "",
            prenom: p.prenom || "",
            age: p.age ?? null,
            telephone: p.telephone || null,
          };
        }
      }

      // Récupérer grossesses du dossier
      const grossessesSnap = await getDocs(
        query(collection(db, "grossesses"), where("dossierId", "==", dossierId), orderBy("createdAt", "desc"))
      );

      const grossesses = [];
      const interventions = [];
      const recentConsultations = [];
      const accouchementsList = [];

      for (const g of grossessesSnap.docs) {
        const gData = { id: g.id, ...g.data() };

        // Compter consultations CPN pour cette grossesse
        const cpnsSnap = await getDocs(
          query(collection(db, "cpns"), where("grossesseId", "==", g.id))
        );
        const consultations = cpnsSnap.size;

        // Construire interventions et consultations récentes à partir des CPN
        for (const cpnDoc of cpnsSnap.docs) {
          const cpnData = cpnDoc.data();
          let dateActionISO = null;
          let label = cpnData.cpn || "CPN";
          if (cpnData.createdAt?.toDate) {
            dateActionISO = cpnData.createdAt.toDate().toISOString();
          }
          // Si consultation liée, récupère dateConsultation
          if (cpnData.consultationId) {
            const cSnap = await getDoc(doc(db, "consultations", cpnData.consultationId));
            if (cSnap.exists()) {
              const cData = cSnap.data();
              const dt = cData.dateConsultation?.toDate ? cData.dateConsultation.toDate() : null;
              if (dt) dateActionISO = dt.toISOString();
              // Ajouter consultation récente (limiter plus tard au niveau page si besoin)
              recentConsultations.push({
                id: cpnDoc.id,
                date: dt ? dt.toISOString() : dateActionISO,
                label: label
              });
            }
          }
          interventions.push({
            id: `cpn-${cpnDoc.id}`,
            id_utilisateur: null,
            type: 'Consultation',
            action: `Ajout ${label}`,
            date_action: dateActionISO || new Date().toISOString(),
            utilisateur: 'Système'
          });
        }

        // Compter accouchements pour cette grossesse et construire interventions
        const accSnap = await getDocs(
          query(collection(db, "accouchements"), where("grossesseId", "==", g.id))
        );
        const accouchements = accSnap.size;
        for (const aDoc of accSnap.docs) {
          const aData = aDoc.data();
          const dt = aData.dateAccouchement ? new Date(aData.dateAccouchement) : (aData.createdAt?.toDate ? aData.createdAt.toDate() : null);
          let enfantsCount = 0;
          // Compter enfants pour description
          const enfantsSnap = await getDocs(query(collection(db, "enfants"), where("accouchementId", "==", aDoc.id)));
          enfantsCount = enfantsSnap.size;

          const mode = aData.modeAccouchement || 'Accouchement';
          interventions.push({
            id: `acc-${aDoc.id}`,
            id_utilisateur: null,
            type: 'Accouchement',
            action: `Ajout accouchement (${mode}${enfantsCount > 1 ? `, ${enfantsCount} enfants` : ''})`,
            date_action: dt ? dt.toISOString() : new Date().toISOString(),
            utilisateur: 'Système'
          });

          accouchementsList.push({
            id: aDoc.id,
            date: dt ? dt.toISOString() : null,
            mode: mode,
          });
        }

        const created = gData.createdAt?.toDate ? gData.createdAt.toDate() : null;
        const annee = created ? created.getFullYear() : new Date().getFullYear();

        grossesses.push({
          id: g.id,
          statut: gData.statut || "En cours",
          annee,
          consultations,
          accouchements,
        });
      }

      const dossier = {
        id: dossierId,
        id_patient: patientId,
        date: dossierData.createdAt?.toDate ? dossierData.createdAt.toDate().toISOString() : null,
        nom_patiente: `${identite.prenom} ${identite.nom}`.trim() || "Inconnu",
        age: identite.age ?? null,
        phone: identite.telephone || null,
        grossesses,
      };

      const hasActivePregnancy = grossesses.some(g => g.statut === 'En cours');

      // Trier les tableaux secondaires
      interventions.sort((a, b) => new Date(a.date_action) - new Date(b.date_action));
      recentConsultations.sort((a, b) => new Date(b.date) - new Date(a.date));
      accouchementsList.sort((a, b) => new Date(b.date) - new Date(a.date));

      setLoading(false);
      return { success: true, dossier, interventions, recentConsultations, accouchements: accouchementsList, hasActivePregnancy };
    } catch (e) {
      setError(e);
      setLoading(false);
      return { success: false, error: e };
    }
  };

  // Récupérer les détails d'une grossesse (consultations CPN et accouchement)
  const getGrossesseDetails = async (dossierId, grossesseId) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier grossesse
      const grossesseSnap = await getDoc(doc(db, "grossesses", grossesseId));
      if (!grossesseSnap.exists()) {
        setLoading(false);
        return { success: false, error: new Error("Grossesse introuvable") };
      }
      const gData = grossesseSnap.data();
      if (gData.dossierId !== dossierId) {
        setLoading(false);
        return { success: false, error: new Error("Grossesse non associée à ce dossier") };
      }

      // Récupérer CPNs de la grossesse et joindre consultations
      const cpnsSnap = await getDocs(query(collection(db, "cpns"), where("grossesseId", "==", grossesseId)));
      const consultations = [];
      
      for (const cpnDoc of cpnsSnap.docs) {
        const cpnData = cpnDoc.data();
        let dateConsultationISO = null;
        let rdv = null;
        let diagnostique = '';
        let ageGest = null;
        
        // Récupérer les données de consultation si disponibles
        if (cpnData.consultationId) {
          const cSnap = await getDoc(doc(db, "consultations", cpnData.consultationId));
          if (cSnap.exists()) {
            const cData = cSnap.data();
            const dt = cData.dateConsultation?.toDate ? cData.dateConsultation.toDate() : null;
            dateConsultationISO = dt ? dt.toISOString() : null;
            rdv = cData.rdv || null;
            diagnostique = cData.diagnostique || '';
          }
        }
        
        // Si pas de date de consultation, utiliser createdAt
        if (!dateConsultationISO && cpnData.createdAt?.toDate) {
          dateConsultationISO = cpnData.createdAt.toDate().toISOString();
        }
        
        // Calculer l'âge gestationnel si on a une date de consultation et DDR
        if (dateConsultationISO && gData.ddr) {
          const dateConsult = new Date(dateConsultationISO);
          const ddr = gData.ddr.toDate ? gData.ddr.toDate() : new Date(gData.ddr);
          const diffTime = Math.abs(dateConsult - ddr);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(diffDays / 7);
          const days = diffDays % 7;
          ageGest = `${weeks}SA + ${days}j`;
        }

        consultations.push({
          id: cpnDoc.id,
          id_grossesse: grossesseId,
          date_consultation: dateConsultationISO,
          nom_medecin: '—',
          nom_sage_femme: '—',
          terme: null,
          age_gest: ageGest,
          sexe_enceinte: '—',
          RDV: rdv,
          diagnostique: diagnostique,
          // Toutes les informations CPN
          dormirsurmild: cpnData.dormirsurmild || false,
          sp_nbr: cpnData.sulfadoxine || '',
          meben: cpnData.mebendazole || '',
          fer_foldine: cpnData.ferfoldine || '',
          vat: cpnData.vat || '',
          gare_depiste: cpnData.garedepiste || false,
          gare_refere: cpnData.garerefere || false,
          diagnostique_associe: diagnostique || '',
          conduite_tenue: cpnData.conduiteTenue || ''
        });
      }

      // Chercher un éventuel accouchement lié à cette grossesse
      const accSnap = await getDocs(query(collection(db, "accouchements"), where("grossesseId", "==", grossesseId)));
      let accouchement = null;
      if (!accSnap.empty) {
        const aDoc = accSnap.docs[0];
        const aData = aDoc.data();

        // Enfants liés
        const enfantsSnap = await getDocs(query(collection(db, "enfants"), where("accouchementId", "==", aDoc.id)));
        const enfants = enfantsSnap.docs.map(ed => {
          const e = ed.data();
          return {
            nom_accouche: e.nomEnfant || '-',
            prenom_accouche: e.prenomEnfant || '-',
            nom_mari: aData.nomMari || '-',
            prenom_mari: aData.prenomMari || '-',
            sexe_accouche: e.sexeEnfant || '-',
            poids: e.poids || '-',
            note: e.note || '-',
          };
        });

        // Dates et heures formatées (on conserve ISO ici; la page fait le formatage)
        const dateAdmission = aData.dateAdmission ? aData.dateAdmission : (aData.createdAt?.toDate ? aData.createdAt.toDate().toISOString() : null);
        const dateAccouchement = aData.dateAccouchement ? aData.dateAccouchement : null;

        accouchement = {
          id: aDoc.id,
          id_dossier_maternite: dossierId,
          nbr_enfant: enfants.length,
          enfants,
          nom_accouche: '-',
          prenom_accouche: '-',
          nom_mari: aData.nomMari || '-',
          prenom_mari: aData.prenomMari || '-',
          heure_admission: aData.heureAdmission || '-',
          date_admission: dateAdmission,
          heure_accouchement: aData.heureAccouchement || '-',
          date_accouchement: dateAccouchement,
          mode_accouchement: aData.modeAccouchement || '-',
          sexe_accouche: '',
          poids: '',
          note: aData.note || '-',
          etat_sortie: '-',
        };
      }

      const created = gData.createdAt?.toDate ? gData.createdAt.toDate() : null;
      const annee = created ? created.getFullYear() : new Date().getFullYear();

      const grossesse = {
        id: grossesseId,
        id_dossier: dossierId,
        statut: gData.statut || 'En cours',
        annee,
        consultations: consultations.sort((a, b) => new Date(a.date_consultation || 0) - new Date(b.date_consultation || 0)),
        accouchement,
        observations: gData.observations || '',
      };

      setLoading(false);
      return { success: true, grossesse };
    } catch (e) {
      setError(e);
      setLoading(false);
      return { success: false, error: e };
    }
  };

  return { loading, error, getDossierDetails, getGrossesseDetails };
}
