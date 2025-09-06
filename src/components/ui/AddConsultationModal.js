"use client";

import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import { X, Stethoscope, Calendar, Shield, Activity, FileText } from 'lucide-react';

export default function AddConsultationModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    date_consultation: '',
    numero_cpn: '',
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

  const handleSubmit = e => {
    e.preventDefault();
    // Validation simple
    if (!form.date_consultation || !form.numero_cpn || !form.RDV) {
      setError('Les champs obligatoires doivent être remplis.');
      return;
    }
    setError('');
    onAdd(form);
    onClose();
    setForm({
      date_consultation: '',
      numero_cpn: '',
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Informations générales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de consultation *</label>
                <DatePicker
                  selected={parseYYYYMMDD(form.date_consultation)}
                  onChange={(date) => handleDateChange('date_consultation', date)}
                  maxDate={today}
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="Choisir une date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro CPN *</label>
                <input 
                  type="text" 
                  name="numero_cpn" 
                  value={form.numero_cpn} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: CPN1, CPN2..."
                  required
                />
              </div>
            </div>
            
            {/* Checkbox MILD */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="dormirsurmild" 
                  name="dormirsurmild" 
                  checked={form.dormirsurmild} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="dormirsurmild" className="text-sm font-medium text-gray-900">
                  Dort sur MILD (Moustiquaire Imprégnée d&apos;Insecticide Longue Durée)
                </label>
              </div>
            </div>
          </div>

          {/* Traitements et vaccinations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Traitements et vaccinations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sulfadoxine Pyrimethamine</label>
                <input 
                  type="text" 
                  name="sp_nbr" 
                  value={form.sp_nbr} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de doses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mebendazole</label>
                <input 
                  type="text" 
                  name="meben" 
                  value={form.meben} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dosage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fer + Foldine</label>
                <input 
                  type="number" 
                  name="fer_foldine" 
                  value={form.fer_foldine} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de comprimés"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Anti-Tétanique</label>
                <input 
                  type="text" 
                  name="vat" 
                  value={form.vat} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VAT1, VAT2..."
                />
              </div>
            </div>
          </div>

          {/* Dépistage des risques */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dépistage des risques</h3>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="gare_depiste" 
                  name="gare_depiste" 
                  checked={form.gare_depiste} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="gare_depiste" className="text-sm font-medium text-gray-900">
                  Grossesse à risque dépistée
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="gare_refere" 
                  name="gare_refere" 
                  checked={form.gare_refere} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="gare_refere" className="text-sm font-medium text-gray-900">
                  Grossesse à risque référée
                </label>
              </div>
            </div>
          </div>

          {/* Diagnostic et conduite */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic et conduite</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic associé</label>
                <textarea 
                  name="diagnostique_associe" 
                  value={form.diagnostique_associe} 
                  onChange={handleChange} 
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Diagnostic médical..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conduite tenue</label>
                <textarea 
                  name="conduite_tenue" 
                  value={form.conduite_tenue} 
                  onChange={handleChange} 
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Actions entreprises..."
                />
              </div>
            </div>
          </div>

          {/* Prochain RDV */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Planification</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prochain rendez-vous *</label>
              <DatePicker
                selected={parseYYYYMMDD(form.RDV)}
                onChange={(date) => handleDateChange('RDV', date)}
                minDate={today}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="Choisir une date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Ajouter la consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
