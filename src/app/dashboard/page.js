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
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
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
        // Attendre que currentUser soit chargé
        if (!currentUser?.centreId) {
          if (mounted) setLoading(false);
          return;
        }

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
  }, [currentUser?.centreId]);

  const topPatients = Math.max(
    Number.isFinite(patientStats?.totalPatients) ? patientStats.totalPatients : 0,
    Array.isArray(patientes) ? patientes.length : 0
  );
  const topCpn = cpnStats?.cpnThisMonth ?? 0;
  const topAcc = accStats?.accouchementsThisMonth ?? 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
       
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden">
  {/* Illustration médicale à droite */}
  <div className="hidden md:block absolute right-0 top-0 w-96 h-full opacity-20">
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
    <p className="text-white/80 mb-1 text-sm sm:text-base">Bonjour,</p>
    <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white" style={{ color: "white" }}>{displayName}</h1>
    <p className="text-white/80 mb-4 sm:mb-8 text-sm sm:text-base">Votre planning d&apos;aujourd&apos;hui.</p>

    {/* Stats plus légères */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-3">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white">{loading ? '…' : topPatients}</div>
          <div className="text-xs sm:text-sm text-white/80">Patientes</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-3">
          <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white">{loading ? '…' : topCpn}</div>
          <div className="text-xs sm:text-sm text-white/80">CPN</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-3">
          <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white">{loading ? '…' : topAcc}</div>
          <div className="text-xs sm:text-sm text-white/80">Accouchements</div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* 3 cartes de métriques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{loading ? '…' : topPatients}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Patientes</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-600 text-xs sm:text-sm font-medium">{loading ? '…' : (patientStats?.patientsThisMonth ?? 0)}</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-green-600 text-xs sm:text-sm font-medium flex items-center hover:text-green-700">
              Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{loading ? '…' : (cpnStats?.totalCpnConsultations ?? 0)}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total CPN</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-600 text-xs sm:text-sm font-medium">{loading ? '…' : (cpnStats?.cpnThisMonth ?? 0)}</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-blue-600 text-xs sm:text-sm font-medium flex items-center hover:text-blue-700">
              Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{loading ? '…' : (accStats?.totalAccouchements ?? 0)}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Accouchements</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-red-600 text-xs sm:text-sm font-medium">{loading ? '…' : (accStats?.accouchementsThisMonth ?? 0)}</div>
              <div className="text-xs text-gray-400">ce mois</div>
            </div>
            <button className="text-red-600 text-xs sm:text-sm font-medium flex items-center hover:text-red-700">
              Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </button>
          </div>
        </div>

        
        {/* Tableau des prochaines CPN */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Prochaines CPN</h3>
                <p className="text-xs sm:text-sm text-gray-500">Consultations prénatales à venir</p>
              </div>
              <button className="hidden sm:block text-blue-600 text-sm font-medium hover:text-blue-700">
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
                  const dateStr = (() => {
                    // Pour les CPN terminées (non virtuelles), afficher dateConsultation
                    // Pour les CPN virtuelles, afficher rdv
                    const dateToDisplay = item.isVirtual ? item.rdv : item.dateConsultation;
                    
                    if (!dateToDisplay) return 'Non définie';
                    
                    try {
                        // Gérer les dates Firestore (avec toDate) et les dates normales
                        const dateObj = dateToDisplay.toDate ? dateToDisplay.toDate() : new Date(dateToDisplay);
                        const dateStr = dateObj.toLocaleDateString('fr-FR');
                        const timeStr = dateObj.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        return `${dateStr} à ${timeStr}`;
                    } catch (error) {
                        return 'Date invalide';
                    }
                  })();
                  const statut = item.status;
                  const getBadgeClass = (status) => {
                    switch(status) {
                      case 'Terminé': return 'bg-green-100 text-green-800';
                      case 'Planifié': return 'bg-blue-100 text-blue-800';
                      case 'En attente': return 'bg-yellow-100 text-yellow-800';
                      case 'En retard': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  const getStatusIcon = (status) => {
                    switch(status) {
                      case 'Terminé': return <CheckCircle className="w-3 h-3" />;
                      case 'Planifié': return <Calendar className="w-3 h-3" />;
                      case 'En attente': return <Clock className="w-3 h-3" />;
                      case 'En retard': return <AlertCircle className="w-3 h-3" />;
                      default: return null;
                    }
                  };
                  const badgeClass = getBadgeClass(statut);
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
                          {getStatusIcon(statut)}
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