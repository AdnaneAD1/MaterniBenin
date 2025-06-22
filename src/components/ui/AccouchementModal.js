import React from "react";

export default function AccouchementModal({ open, onClose, accouchement }) {
  if (!open || !accouchement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-primary">Détail Accouchement</h2>
        <ul className="text-sm text-gray-700 space-y-2">
          <li><b>ID :</b> {accouchement.id}</li>
          <li><b>ID dossier maternité :</b> {accouchement.id_dossier_maternite}</li>
          <li><b>ID enfant :</b> {accouchement.id_enfant}</li>
          <li><b>Nom accoucheur :</b> {accouchement.nom_accoucheur}</li>
          <li><b>Prénom accoucheur :</b> {accouchement.prenom_accoucheur}</li>
          <li><b>Sexe enfant :</b> {accouchement.sexe_enfant}</li>
          <li><b>Date admission :</b> {new Date(accouchement.date_admission).toLocaleDateString('fr-FR')}</li>
          <li><b>Heure admission :</b> {accouchement.heure_admission}</li>
          <li><b>Date d&apos;accouchement :</b> {new Date(accouchement.date_sortie).toLocaleDateString('fr-FR')}</li>
          <li><b>Heure d&apos;accouchement :</b> {accouchement.heure_sortie}</li>
          <li><b>Mode accouchement :</b> {accouchement.mode_accouchement}</li>
          <li><b>État sortie :</b> {accouchement.etat_sortie}</li>
        </ul>
      </div>
    </div>
  );
}
