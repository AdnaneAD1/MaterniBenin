import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

const MOIS_OPTIONS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function GenerateRapportModal({ open, onClose, onGenerate }) {
  const [type, setType] = useState("CPN");
  const [mois, setMois] = useState("");
  const [annee, setAnnee] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (onGenerate) {
        const res = await onGenerate({ type, mois, annee });
        if (res && res.success) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1000);
        } else {
          setError(res?.error?.message || 'Échec de la génération du rapport');
        }
      } else {
        setError('Aucun gestionnaire de génération fourni.');
      }
    } catch (err) {
      setError(err?.message || 'Erreur inconnue lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-primary text-xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileAlt} /> Générer un rapport
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" value={type} onChange={e => setType(e.target.value)} required>
              <option value="CPN">CPN</option>
              <option value="Accouchement">Accouchement</option>
              <option value="Planification">Planification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" value={mois} onChange={e => setMois(e.target.value)} required>
              <option value="">Sélectionner le mois</option>
              {MOIS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2"
              value={annee}
              onChange={e => setAnnee(e.target.value)}
              min="2020"
              max="2100"
              required
            />
          </div>
          {success && <div className="text-green-600 text-sm">Rapport généré avec succès !</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Génération..." : "Générer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
