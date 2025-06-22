"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const METHODE_OPTIONS = ["Implant", "Pilule", "Injectable", "DIU", "Préservatif", "Autre"];
const SEXE_OPTIONS = ["Féminin", "Masculin"];

export default function AddPlanificationModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: '',
    methode_choisis: METHODE_OPTIONS[0],
    sexe: SEXE_OPTIONS[0],
  });
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
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
    onAdd({
      id: `PF${Date.now()}`,
      nom: form.nom,
      prenom: form.prenom,
      age: parseInt(form.age),
      adresse: form.adresse,
      telephone: form.telephone,
      method: form.methode_choisis,
      sexe: form.sexe,
      date: new Date().toISOString().substring(0, 10),
      status: "En cours"
    });
    onClose();
    setForm({
      nom: '',
      prenom: '',
      age: '',
      adresse: '',
      telephone: '',
      methode_choisis: METHODE_OPTIONS[0],
      sexe: SEXE_OPTIONS[0],
    });
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
        <h2 className="text-xl font-bold text-primary mb-4">Ajouter une planification familiale</h2>
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
              name="methode_choisis"
              value={form.methode_choisis}
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

          {error && <div className="text-red-500 text-xs">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary">Ajouter</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
