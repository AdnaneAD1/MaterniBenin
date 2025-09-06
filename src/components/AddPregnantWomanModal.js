import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

export default function AddPregnantWomanModal({ open, onClose, onAdd, editData = null, isEditing = false }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: ''
  });

  // Update form when editData changes
  useEffect(() => {
    if (editData && isEditing) {
      setForm({
        nom: editData.nom || '',
        prenom: editData.prenom || '',
        age: editData.age || '',
        adresse: editData.adresse || '',
        telephone: editData.telephone || ''
      });
    } else {
      setForm({
        nom: '',
        prenom: '',
        age: '',
        adresse: '',
        telephone: ''
      });
    }
  }, [editData, isEditing]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.age || !form.adresse || !form.telephone) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (isNaN(parseInt(form.age))) {
      setError('L\'âge doit être un nombre.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const patientData = { 
        ...form, 
        age: parseInt(form.age), 
        telephone: form.telephone 
      };
      
      if (isEditing && editData) {
        patientData.patientId = editData.patientId;
        patientData.personneId = editData.personneId;
      }
      
      await onAdd(patientData);
      onClose();
      setForm({ nom: '', prenom: '', age: '', adresse: '', telephone: '' });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
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
        <h2 className="text-xl font-bold text-primary mb-4">
          {isEditing ? 'Modifier la patiente' : 'Ajouter une femme enceinte'}
        </h2>
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
          <div className="pt-2 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                isEditing ? 'Modifier' : 'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
