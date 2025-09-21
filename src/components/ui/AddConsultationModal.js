"use client";

import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import { X, Stethoscope, Calendar, Shield, Activity, FileText, Pill, Syringe, Heart, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AddConsultationModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    date_consultation: '',
    dormirsurmild: false,
    sp_nbr: '',
    meben: '',
    fer_foldine: '',
    vat: '',
    gare_depiste: false,
    gare_refere: false,
    diagnostique_associe: '',
    conduite_tenue: '',
    RDV: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();

  const formatToYYYYMMDD = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const parseYYYYMMDD = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const handleDateChange = (name, date) => {
    setForm(f => ({ ...f, [name]: formatToYYYYMMDD(date) }));
  };

  if (!open) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!form.date_consultation || !form.RDV) {
      setError('Les champs obligatoires doivent être remplis.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await onAdd(form);
      
      // Réinitialiser le formulaire seulement après succès
      setForm({
        date_consultation: '',
        dormirsurmild: false,
        sp_nbr: '',
        meben: '',
        fer_foldine: '',
        vat: '',
        gare_depiste: false,
        gare_refere: false,
        diagnostique_associe: '',
        conduite_tenue: '',
        RDV: ''
      });
      
      // Fermer le modal seulement après succès
      onClose();
    } catch (error) {
      setError('Erreur lors de l\'ajout de la consultation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ajouter une CPN</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Informations générales */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Informations de la consultation</h3>
                <p className="text-sm text-gray-600">Date et contexte de la visite</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Date de consultation *
                </label>
                <DatePicker
                  selected={parseYYYYMMDD(form.date_consultation)}
                  onChange={(date) => handleDateChange('date_consultation', date)}
                  maxDate={today}
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="Sélectionner la date de consultation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  required
                />
              </div>
              
              {/* Protection MILD */}
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-6">
                    <input 
                      type="checkbox" 
                      id="dormirsurmild" 
                      name="dormirsurmild" 
                      checked={form.dormirsurmild} 
                      onChange={handleChange} 
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dormirsurmild" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Protection MILD
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Dort sur Moustiquaire Imprégnée d&apos;Insecticide Longue Durée
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traitements et vaccinations */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Traitements préventifs</h3>
                <p className="text-sm text-gray-600">Médicaments et vaccinations administrés</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Pill className="w-4 h-4 text-green-600" />
                  Sulfadoxine Pyrimethamine (SP)
                </label>
                <input 
                  type="text" 
                  name="sp_nbr" 
                  value={form.sp_nbr} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  placeholder="Ex: 2 doses, SP1, SP2..."
                />
                <p className="text-xs text-gray-500 mt-2">Traitement préventif du paludisme</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Pill className="w-4 h-4 text-green-600" />
                  Mébendazole
                </label>
                <input 
                  type="text" 
                  name="meben" 
                  value={form.meben} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  placeholder="Ex: 500mg, 1 comprimé..."
                />
                <p className="text-xs text-gray-500 mt-2">Déparasitage intestinal</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  Fer + Acide Folique
                </label>
                <input 
                  type="number" 
                  name="fer_foldine" 
                  value={form.fer_foldine} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  placeholder="Nombre de comprimés"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-2">Prévention de l&apos;anémie</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Syringe className="w-4 h-4 text-blue-600" />
                  Vaccination Anti-Tétanique (VAT)
                </label>
                <input 
                  type="text" 
                  name="vat" 
                  value={form.vat} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  placeholder="Ex: VAT1, VAT2, Rappel..."
                />
                <p className="text-xs text-gray-500 mt-2">Protection contre le tétanos</p>
              </div>
            </div>
          </div>

          {/* Dépistage des risques */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Évaluation des risques</h3>
                <p className="text-sm text-gray-600">Dépistage et prise en charge des complications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-6">
                    <input 
                      type="checkbox" 
                      id="gare_depiste" 
                      name="gare_depiste" 
                      checked={form.gare_depiste} 
                      onChange={handleChange} 
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="gare_depiste" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Grossesse à risque dépistée
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Facteurs de risque identifiés lors de l&apos;examen
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-6">
                    <input 
                      type="checkbox" 
                      id="gare_refere" 
                      name="gare_refere" 
                      checked={form.gare_refere} 
                      onChange={handleChange} 
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="gare_refere" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Grossesse à risque référée
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Orientation vers un niveau supérieur de soins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic et conduite */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Observations médicales</h3>
                <p className="text-sm text-gray-600">Diagnostic et plan de soins</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Diagnostic et observations
                </label>
                <textarea 
                  name="diagnostique_associe" 
                  value={form.diagnostique_associe} 
                  onChange={handleChange} 
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-sm"
                  placeholder="Décrivez l'état de santé de la patiente, les observations cliniques, les résultats d'examens..."
                />
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Conduite tenue et recommandations
                </label>
                <textarea 
                  name="conduite_tenue" 
                  value={form.conduite_tenue} 
                  onChange={handleChange} 
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-sm"
                  placeholder="Décrivez les actions entreprises, les conseils donnés, les prescriptions..."
                />
              </div>
            </div>
          </div>

          {/* Prochain RDV */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Suivi et planification</h3>
                <p className="text-sm text-gray-600">Programmation du prochain rendez-vous</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-indigo-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                Prochain rendez-vous CPN *
              </label>
              <DatePicker
                selected={parseYYYYMMDD(form.RDV)}
                onChange={(date) => handleDateChange('RDV', date)}
                minDate={today}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="Sélectionner la date du prochain RDV"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommandé : 4 semaines pour un suivi normal, plus tôt si nécessaire
              </p>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enregistrer la consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
