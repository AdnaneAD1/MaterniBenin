"use client";

import { useState } from 'react';
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

export default function Dashboard() {
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
    <h1 className="text-3xl font-bold mb-2 text-white">Sage-femme Lulla Devi</h1>
    <p className="text-white/80 mb-8">Votre planning d&apos;aujourd&apos;hui.</p>

    {/* Stats plus légères */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full p-3 mr-3">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">15</div>
          <div className="text-sm text-white/80">Patientes</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-3 mr-3">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">8</div>
          <div className="text-sm text-white/80">CPN</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center border border-white/20 shadow-lg">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-3 mr-3">
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">3</div>
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
                <div className="text-2xl font-bold text-gray-900">124</div>
                <div className="text-sm text-gray-500">Nouvelles Patientes</div>
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
                <div className="text-2xl font-bold text-gray-900">89</div>
                <div className="text-sm text-gray-500">CPN Patientes</div>
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
                <div className="text-2xl font-bold text-gray-900">45</div>
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
                <div className="text-2xl font-bold text-gray-900">12</div>
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

        
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Rendez-vous</div>
            <div className="text-2xl font-bold text-blue-600">639</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Sage-femmes</div>
            <div className="text-2xl font-bold text-blue-600">83</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Personnel</div>
            <div className="text-2xl font-bold text-blue-600">296</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Consultations</div>
            <div className="text-2xl font-bold text-blue-600">49</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Suivis</div>
            <div className="text-2xl font-bold text-blue-600">372</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Naissances</div>
            <div className="text-2xl font-bold text-blue-600">253</div>
          </div>
        </div> */}

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
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        AH
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mme Afiavi HOUNSA</div>
                        <div className="text-sm text-gray-500">ID: #001</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPN - 2ème trimestre</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20 Juin 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">09:30</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Confirmé
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium">
                        BA
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mme Blandine AGOSSOU</div>
                        <div className="text-sm text-gray-500">ID: #002</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPN - 1er trimestre</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">21 Juin 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10:15</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        CB
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mme Colette BOCOVO</div>
                        <div className="text-sm text-gray-500">ID: #003</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Suivi post-accouchement</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">22 Juin 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">14:00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Confirmé
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                        DL
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mme Danielle LOKONON</div>
                        <div className="text-sm text-gray-500">ID: #004</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPN - 3ème trimestre</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">23 Juin 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">11:30</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Confirmé
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                        EK
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mme Estelle KOUDJO</div>
                        <div className="text-sm text-gray-500">ID: #005</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CPN - 2ème trimestre</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24 Juin 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15:45</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}