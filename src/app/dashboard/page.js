"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Eye, 
  Stethoscope, 
  Baby, 
  Users, 
  Calendar, 
  UserCheck, 
  Activity, 
  Heart,
  TrendingUp,
  ArrowRight,
  Phone,
  DollarSign
} from 'lucide-react';
import { usePatiente } from '@/hooks/patientes';
import { useAuth } from '@/hooks/auth';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const displayName = (currentUser?.displayName 
    || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() 
    || currentUser?.email 
    || 'Utilisateur').trim();

  const { patientes, getPatientStats, getCpnStats, getAccouchementStats, getCpnConsultations } = usePatiente();
  const [patientStats, setPatientStats] = useState(null);
  const [cpnStats, setCpnStats] = useState(null);
  const [accStats, setAccStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [p, cpn, acc, upc] = await Promise.all([
          getPatientStats(),
          getCpnStats(),
          getAccouchementStats(),
          getCpnConsultations(),
        ]);
        if (!mounted) return;
        if (p.success) setPatientStats(p.stats); else setError(p.error || new Error('Erreur stats patientes'));
        if (cpn.success) setCpnStats(cpn.stats); else setError(cpn.error || new Error('Erreur stats CPN'));
        if (acc.success) setAccStats(acc.stats); else setError(acc.error || new Error('Erreur stats accouchements'));
        if (upc.success) setUpcoming(upc.cpnConsultations || []); else setError(upc.error || new Error('Erreur chargement CPN'));
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const topPatients = Math.max(
    Number.isFinite(patientStats?.totalPatients) ? patientStats.totalPatients : 0,
    Array.isArray(patientes) ? patientes.length : 0
  );
  const topCpn = patientStats?.cpnThisMonth ?? cpnStats?.totalCpnConsultations ?? 0;
  const topAcc = accStats?.accouchementsThisMonth ?? 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 space-y-6">
       
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
  {/* Illustration médicale à droite */}
  <div className="absolute right-0 top-0 w-96 h-full opacity-20">
    <div className="absolute right-8 top-8">
      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
        <Heart className="w-10 h-10 text-white" />
      </div>
    </div>
    <div className="absolute right-24 top-24">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <Baby className="w-8 h-8 text-white" />
      </div>
    </div>
    <div className="absolute right-12 bottom-12">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
        <Stethoscope className="w-10 h-10 text-white" />
      </div>
    </div>
  </div>

  <div className="relative z-10">
    <p className="text-white/80 mb-2">Bonjour,</p>
    <h1 className="text-3xl font-bold mb-2 text-white" style={{ color: "white" }}>{displayName}</h1>
    <p className="text-white/80 mb-8">Votre planning d&apos;aujourd&apos;hui.</p>

    {/* Stats plus légères */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full p-3 mr-3">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{loading ? '…' : topPatients}</div>
          <div className="text-sm text-white/80">Patientes</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-3 mr-3">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{loading ? '…' : topCpn}</div>
          <div className="text-sm text-white/80">CPN</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-3 mr-3">
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{loading ? '…' : topAcc}</div>
          <div className="text-sm text-white/80">Accouchements</div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* 4 cartes de métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : topPatients}</div>
                <div className="text-sm text-gray-500">Total Patientes</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-600 text-sm font-medium">+40%</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-green-600 text-sm font-medium flex items-center hover:text-green-700">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : (cpnStats?.totalCpnConsultations ?? 0)}</div>
                <div className="text-sm text-gray-500">Consultations CPN</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-600 text-sm font-medium">+30%</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Baby className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : (accStats?.totalAccouchements ?? 0)}</div>
                <div className="text-sm text-gray-500">Accouchements</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-red-600 text-sm font-medium">+60%</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-red-600 text-sm font-medium flex items-center hover:text-red-700">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : (patientStats?.totalPatients ?? 0)}</div>
                <div className="text-sm text-gray-500">Urgences</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-600 text-sm font-medium">+15%</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-purple-600 text-sm font-medium flex items-center hover:text-purple-700">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        
        {/* Tableau des prochaines CPN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Prochaines CPN</h3>
                <p className="text-sm text-gray-500">Consultations prénatales à venir</p>
              </div>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Voir toutes les CPN →
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patiente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de consultation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Chargement…</td>
                  </tr>
                )}
                {!loading && upcoming.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Aucune CPN à venir</td>
                  </tr>
                )}
                {!loading && upcoming.slice(0, 5).map((item) => {
                  const nom = item.patient?.nom || '';
                  const prenom = item.patient?.prenom || '';
                  const initials = `${(prenom[0]||'').toUpperCase()}${(nom[0]||'').toUpperCase()}` || 'PN';
                  const dateStr = item.rdv ? new Date(item.rdv).toLocaleDateString('fr-FR') : '—';
                  const statut = item.status;
                  const badgeClass = statut === 'Planifié' ? 'bg-yellow-100 text-yellow-800' : (statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800');
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{`Mme ${prenom} ${nom}`.trim()}</div>
                            <div className="text-sm text-gray-500">ID: {item.patient?.patientId || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPN</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dateStr}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">—</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
                          {statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}