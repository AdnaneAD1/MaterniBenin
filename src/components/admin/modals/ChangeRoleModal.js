"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { X, AlertCircle } from "lucide-react";

export default function ChangeRoleModal({ user, centreId, onClose, onSuccess }) {
  const { changeUserRole, loading } = useAdmin();
  const [newRole, setNewRole] = useState(user.role === "sage-femme" ? "responsable" : "sage-femme");
  const [error, setError] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [existingResponsable, setExistingResponsable] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await changeUserRole(
      user.id,
      newRole,
      centreId,
      needsConfirmation
    );

    if (result.success) {
      onSuccess();
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
          <h2 className="text-xl font-bold text-slate-900">Changer le Rôle</h2>
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

          {/* Utilisateur */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">Utilisateur</p>
            <p className="font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>

          {/* Rôle actuel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rôle actuel
            </label>
            <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
              {user.role === "sage-femme" ? "Sage-femme" : "Responsable"}
            </div>
          </div>

          {/* Nouveau rôle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nouveau rôle
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sage-femme">Sage-femme</option>
              <option value="responsable">Responsable</option>
            </select>
          </div>

          {/* Info */}
          {newRole === "responsable" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ⚠️ Si un responsable existe déjà, il sera rétrogradé en sage-femme.
              </p>
            </div>
          )}
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
            disabled={loading || newRole === user.role}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Modification..." : needsConfirmation ? "Confirmer" : "Changer"}
          </button>
        </div>
      </div>
    </div>
  );
}
