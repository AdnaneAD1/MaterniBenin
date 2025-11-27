"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { X, AlertCircle } from "lucide-react";

export default function CreateUserModal({ centreId, onClose, onSuccess }) {
  const { createUser, loading } = useAdmin();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "sage-femme",
  });
  const [error, setError] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [existingResponsable, setExistingResponsable] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);

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

    // Validation
    if (!formData.firstName.trim()) {
      setError("Le prénom est requis");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!formData.email.trim()) {
      setError("L'email est requis");
      return;
    }

    const result = await createUser({
      ...formData,
      centreId,
      confirmReplaceResponsable: needsConfirmation,
    });

    if (result.success) {
      // Afficher le mot de passe généré
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          role: "sage-femme",
        });
      } else {
        onSuccess();
      }
    } else if (result.needsConfirmation) {
      setExistingResponsable(result.existingResponsable);
      setNeedsConfirmation(true);
      setError(result.error);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Créer un Utilisateur</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success - Generated Password */}
          {generatedPassword && (
            <div className="flex gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-1">
                <p className="text-green-800 text-sm font-semibold mb-2">✓ Utilisateur créé avec succès!</p>
                <div className="bg-white p-3 rounded border border-green-200 text-xs space-y-1">
                  <p><strong>Email:</strong> {formData.email || 'N/A'}</p>
                  <p><strong>Mot de passe temporaire:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{generatedPassword}</code></p>
                  <p className="text-green-700 mt-2">Veuillez communiquer ces identifiants à l&apos;utilisateur.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ex: Marie"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ex: Dupont"
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
              placeholder="Ex: marie@centre.bj"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Ex: 0160807271"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rôle *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sage-femme">Sage-femme</option>
              <option value="responsable">Responsable</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            {generatedPassword ? "Fermer" : "Annuler"}
          </button>
          {!generatedPassword && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : needsConfirmation ? "Confirmer" : "Créer"}
            </button>
          )}
          {generatedPassword && (
            <button
              onClick={() => {
                setGeneratedPassword(null);
                setError(null);
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Créer un autre utilisateur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
