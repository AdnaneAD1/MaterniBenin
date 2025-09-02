"use client";

import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import Button from "@/components/ui/Button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative overflow-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold" onClick={onClose}>&times;</button>
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-blue-50">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-xl font-bold text-blue-900">Ajouter un accouchement</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du mari</label>
              <input type="text" name="nomMari" value={form.nomMari} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom du mari</label>
              <input type="text" name="prenomMari" value={form.prenomMari} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre d&apos;enfants *</label>
            <input type="number" name="nbr_enfant" min="1" value={form.nbr_enfant} onChange={handleNbrEnfantChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
          </div>
          <div className="mb-2">
            <div className="font-semibold mb-2 text-blue-800">Informations sur les enfants</div>
            {form.enfants.map((enfant, idx) => (
              <div key={idx} className="p-4 border rounded-lg mb-4 bg-blue-50">
                <div className="font-semibold mb-2 text-blue-700">Enfant #{idx + 1}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Nom enfant *</label>
                    <input type="text" name="nomEnfant" value={enfant.nomEnfant} onChange={e => handleEnfantChange(idx, e)} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Prénom enfant *</label>
                    <input type="text" name="prenomEnfant" value={enfant.prenomEnfant} onChange={e => handleEnfantChange(idx, e)} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Sexe *</label>
                    <select name="sexe" value={enfant.sexe} onChange={e => handleEnfantChange(idx, e)} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required>
                      <option value="">-</option>
                      <option value="F">Fille</option>
                      <option value="M">Garçon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Poids (kg) *</label>
                    <input type="text" name="poids" value={enfant.poids} onChange={e => handleEnfantChange(idx, e)} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Date admission *</label>
              <DatePicker
                selected={form.dateAdmission ? new Date(form.dateAdmission) : null}
                onChange={(date) => handleDateChange('dateAdmission', date)}
                minDate={today}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="Choisir une date"
                className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date accouchement *</label>
              <DatePicker
                selected={form.dateAccouchement ? new Date(form.dateAccouchement) : null}
                onChange={(date) => handleDateChange('dateAccouchement', date)}
                minDate={form.dateAdmission ? new Date(form.dateAdmission) : today}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="Choisir une date"
                className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure admission *</label>
              <input type="time" name="heureAdmission" value={form.heureAdmission} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure accouchement *</label>
              <input type="time" name="heureAccouchement" value={form.heureAccouchement} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Mode accouchement *</label>
              <select name="modeAccouchement" value={form.modeAccouchement} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required>
                <option value="">-</option>
                <option value="Voie basse">Voie basse</option>
                <option value="Césarienne">Césarienne</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note générale</label>
            <input type="text" name="note" value={form.note} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary">Ajouter</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
