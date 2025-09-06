"use client";

import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale('fr', fr);
import Button from "@/components/ui/Button";

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

  const normalizeToDate = (d) => {
    if (!d) return null;
    if (d.toDate) return d.toDate();
    if (typeof d === 'string') {
      const parsed = parseYYYYMMDD(d);
      return parsed || new Date(d);
    }
    return new Date(d);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-primary mb-4">{mode === 'edit' ? 'Modifier la planification' : 'Ajouter une planification familiale'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              min="10"
              max="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              pattern="[0-9]{8,15}"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Méthode choisie</label>
            <select
              name="methodeChoisis"
              value={form.methodeChoisis}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              {METHODE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <select
              name="sexe"
              value={form.sexe}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              {SEXE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostique</label>
            <input
              type="text"
              name="diagnostique"
              value={form.diagnostique}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rendez-vous</label>
            <DatePicker
              selected={parseYYYYMMDD(form.rdv)}
              onChange={handleDateChange}
              minDate={today}
              dateFormat="dd/MM/yyyy"
              locale="fr"
              placeholderText="Choisir une date"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {error && <div className="text-red-500 text-xs">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  {mode === 'edit' ? 'Mise à jour...' : 'Ajout...'}
                </span>
              ) : (
                mode === 'edit' ? 'Mettre à jour' : 'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
