"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { db } from "@/firebase/firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export function useParametresCentre() {
  const { currentUser } = useAuth();
  const [centre, setCentre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
  });

  // Récupérer tous les centres
  const getCentres = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "centres"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      throw new Error(err.message || "Erreur lors de la récupération des centres");
    }
  }, []);

  // Mettre à jour un centre
  const updateCentreData = useCallback(async (centreId, centreData) => {
    try {
      if (!centreId) throw new Error("L'ID du centre est requis");

      await updateDoc(doc(db, "centres", centreId), {
        nom: centreData.nom,
        adresse: centreData.adresse,
        telephone: centreData.telephone,
        email: centreData.email || "",
        dateModification: serverTimestamp(),
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Erreur lors de la mise à jour" };
    }
  }, []);

  // Charger les informations du centre
  const loadCentre = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      if (!currentUser.centreId) {
        setError("Vous n'êtes pas associé à un centre");
        setLoading(false);
        return;
      }

      const centres = await getCentres();
      const userCentre = centres.find((c) => c.id === currentUser.centreId);

      if (userCentre) {
        setCentre(userCentre);
        setFormData({
          nom: userCentre.nom || "",
          adresse: userCentre.adresse || "",
          telephone: userCentre.telephone || "",
          email: userCentre.email || "",
        });
      } else {
        setError("Centre non trouvé");
      }
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du centre");
    } finally {
      setLoading(false);
    }
  }, [currentUser, getCentres]);

  // Charger le centre au montage
  useEffect(() => {
    loadCentre();
  }, [loadCentre]);

  // Gérer les changements de formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Sauvegarder les modifications
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!currentUser?.centreId) {
        setError("Vous n'êtes pas associé à un centre");
        setSaving(false);
        return;
      }

      if (!formData.nom || !formData.adresse || !formData.telephone) {
        setError("Veuillez remplir tous les champs obligatoires");
        setSaving(false);
        return;
      }

      const result = await updateCentreData(currentUser.centreId, formData);

      if (result.success) {
        setCentre((prev) => ({
          ...prev,
          ...formData,
        }));
        setSuccess("Centre mis à jour avec succès !");
        setIsEditing(false);

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [formData, currentUser, updateCentreData]);

  // Annuler l'édition
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData({
      nom: centre?.nom || "",
      adresse: centre?.adresse || "",
      telephone: centre?.telephone || "",
      email: centre?.email || "",
    });
  }, [centre]);

  // Activer le mode édition
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  return {
    centre,
    loading,
    saving,
    error,
    success,
    isEditing,
    formData,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
    setError,
    setSuccess,
  };
}
