"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import { X, Shield, User, Phone, MapPin, Calendar, FileText, Heart } from 'lucide-react';

const METHODE_OPTIONS = ["Implant", "Pilule", "Injectable", "DIU", "Préservatif", "Autre"];
const SEXE_OPTIONS = ["Féminin", "Masculin"];

export default function AddPlanificationModal({ open, onClose, onAdd, onUpdate, mode = 'add', initialData = null }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: '',
    methodeChoisis: METHODE_OPTIONS[0],
    sexe: SEXE_OPTIONS[0],
    diagnostique: '',
    rdv: '',
  });
  // Keep IDs for update mode
  const [ids, setIds] = useState({ planificationId: null, personneId: null, consultationId: null });
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

  const handleDateChange = (date) => {
    setForm(f => ({ ...f, rdv: formatToYYYYMMDD(date) }));
  };

  const normalizeToDate = useCallback((d) => {
    if (!d) return null;
    if (d.toDate) return d.toDate();
    if (typeof d === 'string') {
      const parsed = parseYYYYMMDD(d);
      return parsed || new Date(d);
    }
    return new Date(d);
  }, []);

  // Initialize form when opening in edit mode with initialData
  useEffect(() => {
    if (open && initialData) {
      setForm({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        age: initialData.age ?? '',
        adresse: initialData.adresse || '',
        telephone: initialData.telephone || '',
        methodeChoisis: initialData.methodeChoisis || METHODE_OPTIONS[0],
        sexe: initialData.sexe || SEXE_OPTIONS[0],
        diagnostique: initialData.diagnostique || '',
        rdv: initialData.prochaineVisite ? formatToYYYYMMDD(normalizeToDate(initialData.prochaineVisite)) : '',
      });
      setIds({
        planificationId: initialData.planificationId || initialData.id || null,
        personneId: initialData.personneId || null,
        consultationId: initialData.consultationId || null,
      });
    } else if (open && !initialData && mode === 'add') {
      // reset to defaults when adding
      setForm({
        nom: '', prenom: '', age: '', adresse: '', telephone: '',
        methodeChoisis: METHODE_OPTIONS[0], sexe: SEXE_OPTIONS[0], diagnostique: '', rdv: ''
      });
      setIds({ planificationId: null, personneId: null, consultationId: null });
    }
  }, [open, initialData, mode]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.age || !form.adresse || !form.telephone) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (isNaN(parseInt(form.age)) || isNaN(parseInt(form.telephone))) {
      setError("L'âge et le téléphone doivent être des nombres.");
      return;
    }
    setError('');
    try {
      setIsSubmitting(true);
      if (mode === 'edit' && onUpdate) {
        await onUpdate({
          ...ids,
          nom: form.nom,
          prenom: form.prenom,
          age: parseInt(form.age),
          adresse: form.adresse,
          telephone: form.telephone,
          methodeChoisis: form.methodeChoisis,
          sexe: form.sexe,
          diagnostique: form.diagnostique,
          rdv: form.rdv,
        });
      } else if (onAdd) {
        await onAdd({
          nom: form.nom,
          prenom: form.prenom,
          age: parseInt(form.age),
          adresse: form.adresse,
          telephone: form.telephone,
          methodeChoisis: form.methodeChoisis,
          sexe: form.sexe,
          diagnostique: form.diagnostique,
          rdv: form.rdv,
        });
      }
      onClose();
      setForm({
        nom: '',
        prenom: '',
        age: '',
        adresse: '',
        telephone: '',
        methodeChoisis: METHODE_OPTIONS[0],
        sexe: SEXE_OPTIONS[0],
        diagnostique: '',
        rdv: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Modifier la planification familiale' : 'Ajouter une planification familiale'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Informations personnelles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Âge *</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="10"
                  max="60"
                  placeholder="Ex: 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sexe *</label>
                <select
                  name="sexe"
                  value={form.sexe}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {SEXE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  pattern="[0-9]{8,15}"
                  placeholder="Ex: 97123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                <input
                  type="text"
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Ex: Cotonou, Zogbo"
                />
              </div>
            </div>
          </div>

          {/* Méthode contraceptive */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Méthode contraceptive</h3>
            </div>
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Méthode choisie *</label>
              <select
                name="methodeChoisis"
                value={form.methodeChoisis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {METHODE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Diagnostic et suivi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Diagnostic et suivi</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic *</label>
                <textarea
                  name="diagnostique"
                  value={form.diagnostique}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                  placeholder="Diagnostic médical et observations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prochain rendez-vous</label>
                <DatePicker
                  selected={parseYYYYMMDD(form.rdv)}
                  onChange={handleDateChange}
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="Choisir une date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
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
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {mode === 'edit' ? 'Mise à jour...' : 'Ajout...'}
                </>
              ) : (
                mode === 'edit' ? 'Mettre à jour' : 'Ajouter la planification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
