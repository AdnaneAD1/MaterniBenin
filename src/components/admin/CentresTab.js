"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import CreateCentreModal from "./modals/CreateCentreModal";
import EditCentreModal from "./modals/EditCentreModal";

export default function CentresTab() {
  const { listCentres, loading } = useAdmin();
  const [centres, setCentres] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [loadingCentres, setLoadingCentres] = useState(true);

  // Charger les centres
  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    setLoadingCentres(true);
    const result = await listCentres();
    if (result.success) {
      setCentres(result.centres || []);
    }
    setLoadingCentres(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadCentres();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCentre(null);
    loadCentres();
  };

  const handleEditCentre = (centre) => {
    setSelectedCentre(centre);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      {/* Header avec bouton créer */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Centres de Santé</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nouveau Centre
        </button>
      </div>

      {/* Loading */}
      {loadingCentres && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Liste des centres */}
      {!loadingCentres && centres.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Adresse</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Responsable</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Licence</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((centre) => (
                <tr key={centre.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{centre.nom}</td>
                  <td className="py-3 px-4 text-slate-600">{centre.adresse}</td>
                  <td className="py-3 px-4 text-slate-600">{centre.telephone}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {centre.responsableNom ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {centre.responsableNom}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {centre.licenceAchetee ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={18} />
                        Payée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={18} />
                        Non payée
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        centre.statut === "actif"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {centre.statut === "actif" ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleEditCentre(centre)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aucun centre */}
      {!loadingCentres && centres.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">Aucun centre créé</p>
          <p className="text-slate-500 text-sm mt-1">Cliquez sur "Nouveau Centre" pour en créer un</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCentreModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedCentre && (
        <EditCentreModal
          centre={selectedCentre}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCentre(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
