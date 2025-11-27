"use client";

import { Building2, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle, Loader } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParametresCentre } from "@/hooks/useParametresCentre";

export default function ParametresCentrePage() {
  const {
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
  } = useParametresCentre();

  if (loading) {
    return (
      <DashboardLayout title="Paramètres du Centre">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des informations du centre...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paramètres du Centre">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Paramètres du Centre</h1>
          <p className="text-slate-600">Gérez les informations de votre centre de santé</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Informations du Centre</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Modifier
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du Centre *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du centre"
                  />
                ) : (
                  <p className="text-slate-900 font-semibold">{centre?.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Adresse *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adresse du centre"
                  />
                ) : (
                  <p className="text-slate-900 font-semibold">{centre?.adresse}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Téléphone *
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro de téléphone"
                  />
                ) : (
                  <p className="text-slate-900 font-semibold">{centre?.telephone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email du centre"
                  />
                ) : (
                  <p className="text-slate-900 font-semibold">{centre?.email || "Non renseigné"}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Statut</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-slate-900 font-semibold capitalize">{centre?.statut || "Actif"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Licence</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-slate-900 font-semibold">
                    {centre?.licenceAchetee ? "Licence Payée" : "Pas de licence"}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Enregistrer
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 rounded-lg transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
