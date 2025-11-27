"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, addDoc, setDoc, doc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export function useSeeder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Créer un utilisateur admin de test
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  const seedAdminUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const auth = getAuth();

      // Vérifier si l'admin existe déjà
      const adminQuery = query(
        collection(db, "users"),
        where("email", "==", "admin@materninbenin.bj"),
        where("role", "==", "admin")
      );
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        setLoading(false);
        setSuccess("L'utilisateur admin existe déjà");
        return { success: true, message: "L'utilisateur admin existe déjà" };
      }

      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "admin@materninbenin.bj",
        "Admin@123456"
      );

      const uid = userCredential.user.uid;

      // Créer le document utilisateur dans Firestore avec le uid comme ID
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        email: "admin@materninbenin.bj",
        firstName: "Admin",
        lastName: "MaterninBenin",
        displayName: "Admin MaterninBenin",
        phoneNumber: "0160000000",
        role: "admin",
        centreId: null,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
      });

      setLoading(false);
      setSuccess("Utilisateur admin créé avec succès !");
      return {
        success: true,
        message: "Utilisateur admin créé avec succès !",
      };
    } catch (err) {
      const errorMsg = err.message || "Erreur lors de la création de l'admin";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Créer un centre de test
   * @returns {Promise<{success: boolean, centreId?: string, error?: string}>}
   */
  const seedTestCentre = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Vérifier si le centre existe déjà
      const centreQuery = query(
        collection(db, "centres"),
        where("nom", "==", "Centre de Test")
      );
      const centreSnapshot = await getDocs(centreQuery);

      if (!centreSnapshot.empty) {
        setLoading(false);
        setSuccess("Le centre de test existe déjà");
        return { success: true, centreId: centreSnapshot.docs[0].id };
      }

      // Créer le centre
      const centreRef = await addDoc(collection(db, "centres"), {
        nom: "Centre de Test",
        adresse: "123 Rue de Test, Cotonou",
        telephone: "0160000000",
        email: "test@centre.bj",
        responsableId: null,
        responsableNom: null,
        responsableEmail: null,
        licenceAchetee: true,
        dateLicenceAchat: serverTimestamp(),
        statut: "actif",
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
      });

      setLoading(false);
      setSuccess("Centre de test créé avec succès !");
      return { success: true, centreId: centreRef.id };
    } catch (err) {
      const errorMsg = err.message || "Erreur lors de la création du centre";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  return {
    loading,
    error,
    success,
    seedAdminUser,
    seedTestCentre,
  };
}
