import React from "react";
import { X, Stethoscope, Calendar, User, Shield, Activity, FileText, Clock } from 'lucide-react';

export default function ConsultationModal({ open, onClose, consultation }) {
  if (!open || !consultation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Détail de la consultation prénatale</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Informations générales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                label="Date de consultation" 
                value={new Date(consultation.date_consultation).toLocaleDateString('fr-FR')} 
                icon={<Calendar className="w-4 h-4 text-blue-500" />}
              />
              <InfoCard 
                label="Prochain RDV" 
                value={consultation.RDV ?? 'Non programmé'} 
                icon={<Clock className="w-4 h-4 text-blue-500" />}
              />
            </div>
          </div>

          {/* Prévention */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Prévention et protection</h3>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow 
                  label="Dort sur MILDA" 
                  value={consultation.dormirsurmild !== undefined ? (consultation.dormirsurmild ? 'Oui' : 'Non') : 'Non renseigné'} 
                  status={consultation.dormirsurmild}
                />
                <InfoRow 
                  label="Dépistage GAR" 
                  value={consultation.gare_depiste !== undefined ? (consultation.gare_depiste ? 'Oui' : 'Non') : 'Non renseigné'} 
                  status={consultation.gare_depiste}
                />
                <InfoRow 
                  label="Référence GAR" 
                  value={consultation.gare_refere !== undefined ? (consultation.gare_refere ? 'Oui' : 'Non') : 'Non renseigné'} 
                  status={consultation.gare_refere}
                />
              </div>
            </div>
          </div>

          {/* Traitements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Traitements et suppléments</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                label="Sulfadoxine Pyrimethamine" 
                value={consultation.sp_nbr || 'Non prescrit'} 
                icon={<Activity className="w-4 h-4 text-purple-500" />}
              />
              <InfoCard 
                label="Mebendazole" 
                value={consultation.meben || 'Non prescrit'} 
                icon={<Activity className="w-4 h-4 text-purple-500" />}
              />
              <InfoCard 
                label="Fer + Foldine" 
                value={consultation.fer_foldine ? `${consultation.fer_foldine} comprimés` : 'Non prescrit'} 
                icon={<Activity className="w-4 h-4 text-purple-500" />}
              />
              <InfoCard 
                label="Vaccination Anti-Tétanique" 
                value={consultation.vat || 'Non effectuée'} 
                icon={<Activity className="w-4 h-4 text-purple-500" />}
              />
            </div>
          </div>

          {/* Diagnostic et conduite */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic et conduite</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h4 className="font-semibold text-orange-900 mb-2">Diagnostic associé</h4>
                <p className="text-sm text-gray-700">
                  {consultation.diagnostique_associe || 'Aucun diagnostic particulier'}
                </p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h4 className="font-semibold text-orange-900 mb-2">Conduite tenue</h4>
                <p className="text-sm text-gray-700">
                  {consultation.conduite_tenue || 'Aucune conduite particulière'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour les cartes d'information
function InfoCard({ label, value, icon }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// Composant pour les lignes d'information avec statut
function InfoRow({ label, value, status }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900">{value}</span>
        {status !== undefined && (
          <div className={`w-2 h-2 rounded-full ${
            status ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        )}
      </div>
    </div>
  );
}
