"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { db } from "@/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";

export default function StatistiquesTab() {
  const { listCentres } = useAdmin();
  const [stats, setStats] = useState({
    totalCentres: 0,
    totalUtilisateurs: 0,
    totalPatientes: 0,
    totalRapports: 0,
    centreStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      // Récupérer tous les centres
      const centresResult = await listCentres();
      const centres = centresResult.centres || [];

      // Récupérer les statistiques globales
      const usersSnapshot = await getDocs(collection(db, "users"));
      const patientsSnapshot = await getDocs(collection(db, "personnes"));
      const reportsSnapshot = await getDocs(collection(db, "rapports"));

      // Statistiques par centre
      const centreStats = await Promise.all(
        centres.map(async (centre) => {
          const centreUsers = usersSnapshot.docs.filter(
            (doc) => doc.data().centreId === centre.id
          );
          const centrePatients = patientsSnapshot.docs.filter(
            (doc) => doc.data().centreId === centre.id
          );
          const centreReports = reportsSnapshot.docs.filter(
            (doc) => doc.data().centreId === centre.id
          );

          return {
            centreId: centre.id,
            centreName: centre.nom,
            utilisateurs: centreUsers.length,
            patientes: centrePatients.length,
            rapports: centreReports.length,
          };
        })
      );

      setStats({
        totalCentres: centres.length,
        totalUtilisateurs: usersSnapshot.size,
        totalPatientes: patientsSnapshot.size,
        totalRapports: reportsSnapshot.size,
        centreStats,
      });
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Statistiques Globales</h2>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Centres */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Centres</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalCentres}</p>
            </div>
            <Building2 size={40} className="text-blue-300" />
          </div>
        </div>

        {/* Total Utilisateurs */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalUtilisateurs}</p>
            </div>
            <Users size={40} className="text-purple-300" />
          </div>
        </div>

        {/* Total Patientes */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-600 text-sm font-medium">Total Patientes</p>
              <p className="text-3xl font-bold text-pink-900 mt-2">{stats.totalPatientes}</p>
            </div>
            <TrendingUp size={40} className="text-pink-300" />
          </div>
        </div>

        {/* Total Rapports */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Rapports</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.totalRapports}</p>
            </div>
            <FileText size={40} className="text-green-300" />
          </div>
        </div>
      </div>

      {/* Tableau détaillé par centre */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Détails par Centre</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Centre</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Utilisateurs</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Patientes</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Rapports</th>
              </tr>
            </thead>
            <tbody>
              {stats.centreStats.map((centre) => (
                <tr key={centre.centreId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{centre.centreName}</td>
                  <td className="py-3 px-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {centre.utilisateurs}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                      {centre.patientes}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {centre.rapports}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
