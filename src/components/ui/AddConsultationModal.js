import React, { useState } from "react";
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
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Date consultation *</label>
              <input type="date" name="date_consultation" value={form.date_consultation} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Numéro CPN *</label>
              <input type="number" name="numero_cpn" value={form.numero_cpn} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required min="1" />
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="dormirsurmild" name="dormirsurmild" checked={form.dormirsurmild} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="dormirsurmild" className="text-sm">Dort sur MILDA</label>
            </div>
          </div>
          {/* Section Suivi */}
          <div className="bg-blue-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 border">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">SP Nbr</label>
              <input type="text" name="sp_nbr" value={form.sp_nbr} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">MEBEN</label>
              <input type="text" name="meben" value={form.meben} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Fer + Foldine</label>
              <input type="number" name="fer_foldine" value={form.fer_foldine} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" min="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">VAT</label>
              <input type="text" name="vat" value={form.vat} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="gare_depiste" name="gare_depiste" checked={form.gare_depiste} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="gare_depiste" className="text-sm">Gare dépisté</label>
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="gare_refere" name="gare_refere" checked={form.gare_refere} onChange={handleChange} className="accent-blue-600 scale-110" />
              <label htmlFor="gare_refere" className="text-sm">Gare référé</label>
            </div>
          </div>
          {/* Section Diagnostic */}
          <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 gap-4 border">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Diagnostic associé</label>
              <input type="text" name="diagnostique_associe" value={form.diagnostique_associe} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Conduite tenue</label>
              <input type="text" name="conduite_tenue" value={form.conduite_tenue} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
            </div>
          </div>
          {/* Section RDV */}
          <div className="bg-blue-50 rounded-lg p-3 grid grid-cols-1 gap-4 border">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Prochain RDV *</label>
              <input type="date" name="RDV" value={form.RDV} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date consultation *</label>
            <input type="date" name="date_consultation" value={form.date_consultation} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro CPN *</label>
            <input type="number" name="numero_cpn" value={form.numero_cpn} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required min="1" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="dormirsurmild" checked={form.dormirsurmild} onChange={handleChange} />
            <label className="text-sm">Dort sur MILDA</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SP Nbr</label>
            <input type="text" name="sp_nbr" value={form.sp_nbr} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MEBEN</label>
            <input type="text" name="meben" value={form.meben} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fer + Foldine</label>
            <input type="number" name="fer_foldine" value={form.fer_foldine} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">VAT</label>
            <input type="text" name="vat" value={form.vat} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="gare_depiste" checked={form.gare_depiste} onChange={handleChange} />
            <label className="text-sm">Gare dépisté</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="gare_refere" checked={form.gare_refere} onChange={handleChange} />
            <label className="text-sm">Gare référé</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Diagnostic associé</label>
            <input type="text" name="diagnostique_associe" value={form.diagnostique_associe} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conduite tenue</label>
            <input type="text" name="conduite_tenue" value={form.conduite_tenue} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prochain RDV *</label>
            <input type="date" name="RDV" value={form.RDV} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
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
