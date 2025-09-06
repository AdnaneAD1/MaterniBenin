"use client";

import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import { X, Baby, Calendar, Clock, User, Heart } from 'lucide-react';

export default function AddAccouchementModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    nbr_enfant: 1,
    enfants: [{
      nomEnfant: '',
      prenomEnfant: '',
      sexe: '',
      poids: '',
    }],
    nomMari: '',
    prenomMari: '',
    heureAdmission: '',
    dateAdmission: '',
    heureAccouchement: '',
    dateAccouchement: '',
    modeAccouchement: '',
    note: ''
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

  const handleDateChange = (name, date) => {
    setForm(f => ({ ...f, [name]: formatToYYYYMMDD(date) }));
  };

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEnfantChange = (idx, e) => {
    const { name, value } = e.target;
    setForm(f => {
      const enfants = [...f.enfants];
      enfants[idx][name] = value;
      return { ...f, enfants };
    });
  };

  const handleNbrEnfantChange = e => {
    const value = parseInt(e.target.value, 10);
    setForm(f => {
      let enfants = [...f.enfants];
      if (value > enfants.length) {
        enfants = enfants.concat(Array(value - enfants.length).fill({ nomEnfant: '', prenomEnfant: '', sexe: '', poids: '' }));
      } else if (value < enfants.length) {
        enfants = enfants.slice(0, value);
      }
      return { ...f, nbr_enfant: value, enfants };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.nbr_enfant || !form.nomMari || !form.prenomMari || !form.heureAdmission || !form.dateAdmission || !form.heureAccouchement || !form.dateAccouchement || !form.modeAccouchement) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    for (let i = 0; i < form.nbr_enfant; i++) {
      const enfant = form.enfants[i];
      if (!enfant.nomEnfant || !enfant.prenomEnfant || !enfant.sexe || !enfant.poids) {
        setError(`Veuillez remplir tous les champs pour l'enfant #${i + 1}`);
        return;
      }
    }
    setError('');
    onAdd(form);
    onClose();
    setForm({
      nbr_enfant: 1,
      enfants: [{ nomEnfant: '', prenomEnfant: '', sexe: '', poids: '' }],
      nomMari: '',
      prenomMari: '',
      heureAdmission: '',
      dateAdmission: '',
      heureAccouchement: '',
      dateAccouchement: '',
      modeAccouchement: '',
      note: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ajouter un accouchement</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Informations parents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations des parents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du mari *</label>
                <input 
                  type="text" 
                  name="nomMari" 
                  value={form.nomMari} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom du mari *</label>
                <input 
                  type="text" 
                  name="prenomMari" 
                  value={form.prenomMari} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nombre d'enfants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'enfants *</label>
            <input 
              type="number" 
              name="nbr_enfant" 
              min="1" 
              value={form.nbr_enfant} 
              onChange={handleNbrEnfantChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required 
            />
          </div>

          {/* Informations enfants */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations des enfants</h3>
            </div>
            {form.enfants.map((enfant, idx) => (
              <div key={idx} className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
                <h4 className="font-semibold text-pink-900 mb-3">Enfant #{idx + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'enfant *</label>
                    <input 
                      type="text" 
                      name="nomEnfant" 
                      value={enfant.nomEnfant} 
                      onChange={e => handleEnfantChange(idx, e)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom de l'enfant *</label>
                    <input 
                      type="text" 
                      name="prenomEnfant" 
                      value={enfant.prenomEnfant} 
                      onChange={e => handleEnfantChange(idx, e)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexe *</label>
                    <select 
                      name="sexe" 
                      value={enfant.sexe} 
                      onChange={e => handleEnfantChange(idx, e)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="F">Fille</option>
                      <option value="M">Garçon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg) *</label>
                    <input 
                      type="text" 
                      name="poids" 
                      value={enfant.poids} 
                      onChange={e => handleEnfantChange(idx, e)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Ex: 3.2"
                      required 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dates et heures */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dates et heures</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'admission *</label>
                <DatePicker
                  selected={form.dateAdmission ? new Date(form.dateAdmission) : null}
                  onChange={(date) => handleDateChange('dateAdmission', date)}
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="Choisir une date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'accouchement *</label>
                <DatePicker
                  selected={form.dateAccouchement ? new Date(form.dateAccouchement) : null}
                  onChange={(date) => handleDateChange('dateAccouchement', date)}
                  minDate={form.dateAdmission ? new Date(form.dateAdmission) : today}
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="Choisir une date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure d'admission *</label>
                <input 
                  type="time" 
                  name="heureAdmission" 
                  value={form.heureAdmission} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure d'accouchement *</label>
                <input 
                  type="time" 
                  name="heureAccouchement" 
                  value={form.heureAccouchement} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Mode d'accouchement et note */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Détails médicaux</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode d'accouchement *</label>
              <select 
                name="modeAccouchement" 
                value={form.modeAccouchement} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner le mode</option>
                <option value="Voie basse">Voie basse</option>
                <option value="Césarienne">Césarienne</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note générale</label>
              <textarea 
                name="note" 
                value={form.note} 
                onChange={handleChange} 
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Observations particulières..."
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
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Ajouter l'accouchement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
