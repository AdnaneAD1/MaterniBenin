"use client";

import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import Button from "@/components/ui/Button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold" onClick={onClose}>&times;</button>
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-blue-50">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-xl font-bold text-blue-900">Ajouter une consultation</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Informations principales */}
          <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 border">
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="dormirsurmild" name="dormirsurmild" checked={form.dormirsurmild} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="dormirsurmild" className="text-sm">Dort sur MILD</label>
            </div>
          </div>
          {/* Section Suivi */}
          <div className="bg-blue-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 border">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre Sulfadoxine Pyrimethamine</label>
              <input type="text" name="sulfadoxine" value={form.sulfadoxine} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Mebendazole</label>
              <input type="text" name="mebendazole" value={form.mebendazole} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Fer + Foldine</label>
              <input type="number" name="ferfoldine" value={form.ferfoldine} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" min="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Vaccination Anti Tétanique</label>
              <input type="text" name="vat" value={form.vat} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="garedepiste" name="garedepiste" checked={form.garedepiste} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="garedepiste" className="text-sm">Grossesse a risque dépisté</label>
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="garerefere" name="garerefere" checked={form.garerefere} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="garerefere" className="text-sm">Grossesse a risque référé</label>
            </div>
          </div>
          {/* Section Diagnostic */}
          <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 gap-4 border">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Diagnostique</label>
              <input type="text" name="diagnostique" value={form.diagnostique} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Conduite tenue</label>
              <input type="text" name="conduiteTenue" value={form.conduiteTenue} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prochain RDV *</label>
            <DatePicker
              selected={parseYYYYMMDD(form.RDV)}
              onChange={(date) => handleDateChange('RDV', date)}
              minDate={today}
              dateFormat="dd/MM/yyyy"
              locale="fr"
              placeholderText="Choisir une date"
              className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2"
              required
            />
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
