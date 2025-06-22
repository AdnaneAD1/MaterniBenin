import React from "react";

export default function ConsultationModal({ open, onClose, consultation }) {
  if (!open || !consultation) return null;

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
        <h2 className="text-lg font-bold mb-4 text-primary">Détail Consultation Prénatale</h2>
        <ul className="text-sm text-gray-700 space-y-2">
          <li><b>Date :</b> {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}</li>
          <li><b>Sage-femme :</b> {consultation.nom_sage_femme}</li>
          <li><b>Dort sur MILDA :</b> {consultation.dormirsurmild !== undefined ? (consultation.dormirsurmild ? 'Oui' : 'Non') : '-'}</li>
          <li><b>SP nombre :</b> {consultation.sp_nbr ?? '-'}</li>
          <li><b>Mebendazole :</b> {consultation.meben ?? '-'}</li>
          <li><b>Fer/Foldine (comprimés) :</b> {consultation.fer_foldine ?? '-'}</li>
          <li><b>VAT :</b> {consultation.vat ?? '-'}</li>
          <li><b>Dépistage GAR :</b> {consultation.gare_depiste !== undefined ? (consultation.gare_depiste ? 'Oui' : 'Non') : '-'}</li>
          <li><b>Référence GAR :</b> {consultation.gare_refere !== undefined ? (consultation.gare_refere ? 'Oui' : 'Non') : '-'}</li>
          <li><b>Diagnostic associé :</b> {consultation.diagnostique_associé ?? '-'}</li>
          <li><b>Conduite tenue :</b> {consultation.conduite_tenue ?? '-'}</li>
          <li><b>Prochain RDV :</b> {consultation.RDV ?? '-'}</li>
        </ul>
      </div>
    </div>
  );
}
