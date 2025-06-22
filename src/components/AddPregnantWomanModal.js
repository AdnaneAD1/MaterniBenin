import React, { useState } from 'react';
import Button from './ui/Button';

export default function AddPregnantWomanModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.age || !form.adresse || !form.telephone) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (isNaN(parseInt(form.age)) || isNaN(parseInt(form.telephone))) {
      setError('L\'âge et le téléphone doivent être des nombres.');
      return;
    }
    setError('');
    onAdd({ ...form, age: parseInt(form.age), telephone: form.telephone });
    onClose();
    setForm({ nom: '', prenom: '', age: '', adresse: '', telephone: '' });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-primary text-xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-primary mb-4">Ajouter une femme enceinte</h2>
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary">Ajouter</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
