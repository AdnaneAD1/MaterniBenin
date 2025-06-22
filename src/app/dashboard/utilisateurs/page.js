"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

const MOCK_USERS = [
  { id: 1, nom: "Agossou", prenom: "Marie", telephone: "97000001", email: "marie.agossou@hopital.bj" },
  { id: 2, nom: "Kpoviessi", prenom: "Clarisse", telephone: "97000002", email: "clarisse.kpoviessi@hopital.bj" },
];

export default function UtilisateursPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "" });
  const [error, setError] = useState("");

  const handleRemove = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.telephone || !form.email) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    setUsers([
      ...users,
      { ...form, id: Date.now() },
    ]);
    setForm({ nom: "", prenom: "", telephone: "", email: "" });
    setError("");
    setModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-6 px-2 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
    <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4 4 0 1116 7a4 4 0 01-9 7.13z" /></svg>
    <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Gestion des sages-femmes</h1>
  </div>
  <Button icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow hover:bg-blue-700 transition-all">
    Ajouter
  </Button>
</div>
          <div className="bg-white rounded-2xl shadow-lg p-0 overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="sticky top-0 z-10">
      <tr className="bg-blue-100 text-blue-900">
        <th className="p-3 text-left font-semibold rounded-tl-2xl">Nom</th>
        <th className="p-3 text-left font-semibold">Prénom</th>
        <th className="p-3 text-left font-semibold">Téléphone</th>
        <th className="p-3 text-left font-semibold">Email</th>
        <th className="p-3 rounded-tr-2xl"></th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id} className="transition-all hover:bg-blue-50 border-b last:border-b-0">
          <td className="p-3 font-medium text-gray-800">{user.nom}</td>
          <td className="p-3 text-gray-700">{user.prenom}</td>
          <td className="p-3 text-gray-700">{user.telephone}</td>
          <td className="p-3 text-gray-700">{user.email}</td>
          <td className="p-3 text-right">
            <Button
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded px-3 py-1 text-xs font-semibold flex items-center gap-2"
              icon={<FontAwesomeIcon icon={faTrash} />} 
              onClick={() => handleRemove(user.id)}
            >
              Supprimer
            </Button>
          </td>
        </tr>
      ))}
      {users.length === 0 && (
        <tr><td colSpan={5} className="text-center text-gray-400 py-6">Aucun utilisateur</td></tr>
      )}
    </tbody>
  </table>
</div>

          {/* Modal d'ajout */}
          {modalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-md relative max-h-[90vh] overflow-auto">
      <div className="flex items-center gap-2 px-6 py-4 rounded-t-2xl bg-blue-100 border-b">
        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4 4 0 1116 7a4 4 0 01-9 7.13z" /></svg>
        <h2 className="text-xl font-bold text-blue-900">Ajouter une sage-femme</h2>
        <button className="ml-auto text-gray-400 hover:text-gray-700 text-lg font-bold" onClick={() => setModalOpen(false)}>&times;</button>
      </div>
      <form onSubmit={handleAdd} className="space-y-5 px-6 py-6">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Nom *</label>
          <input type="text" name="nom" value={form.nom} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Prénom *</label>
          <input type="text" name="prenom" value={form.prenom} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Téléphone *</label>
          <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" required />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg">Annuler</Button>
          <Button type="submit" variant="primary" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">Ajouter</Button>
        </div>
      </form>
    </div>
  </div>
)}
        </div>
      </div>
    </DashboardLayout>
  );
}
