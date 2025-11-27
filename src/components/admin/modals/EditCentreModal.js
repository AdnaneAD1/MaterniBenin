"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { X, AlertCircle } from "lucide-react";

export default function EditCentreModal({ centre, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: centre.nom || "",
    adresse: centre.adresse || "",
    telephone: centre.telephone || "",
    email: centre.email || "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.nom.trim()) {
        throw new Error("Le nom du centre est requis");
      }
      if (!formData.adresse.trim()) {
        throw new Error("L'adresse est requise");
      }
      if (!formData.telephone.trim()) {
        throw new Error("Le téléphone est requis");
      }
      if (!formData.email.trim()) {
        throw new Error("L'email est requis");
      }

      // Mettre à jour
      await updateDoc(doc(db, "centres", centre.id), {
        nom: formData.nom,
        adresse: formData.adresse,
        telephone: formData.telephone,
        email: formData.email,
        dateModification: serverTimestamp(),
      });

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Modifier le Centre</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom du centre *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Modification..." : "Modifier"}
          </button>
        </div>
      </div>
    </div>
  );
}
