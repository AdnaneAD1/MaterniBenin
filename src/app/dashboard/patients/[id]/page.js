"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from "react";
import { usePatiente } from '@/hooks/patientes';
import { 
    ArrowLeft, 
    AlertCircle, 
    Home, 
    ChevronRight, 
    Edit, 
    Calendar, 
    Phone, 
    FileText, 
    User, 
    Activity
  } from 'lucide-react';
  
export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const { getPatientDetails } = usePatiente();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getPatientDetails(id);
                if (!mounted) return;
                if (res.success) setPatient(res.patient);
                else setError(res.error || new Error('Patiente introuvable'));
            } catch (e) {
                if (mounted) setError(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
                        <p className="text-gray-700 text-lg font-medium">Chargement de la patiente...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!patient || error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {error ? 'Erreur de chargement' : 'Patiente introuvable'}
                        </h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {error ? (error.message || 'Une erreur est survenue') : 'Cette patiente n\'existe pas dans la base de données.'}
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-10 px-6 sm:px-12">
                <div className="max-w-6xl mx-auto space-y-10">
                    
                    {/* Header avec breadcrumb et actions */}
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                            <Home className="w-4 h-4" />
                            <ChevronRight className="w-4 h-4" />
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Patients</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-semibold">Profil</span>
                        </nav>
                        
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => router.back()}
                                    className="group flex items-center justify-center w-12 h-12 bg-white/90 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                                </button>
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Profil de la patiente</h1>
                                    <p className="text-gray-600 font-medium">Consultez et gérez les informations médicales</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* <button className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Planifier CPN
                                </button> */}
                                <button className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Carte principale info patiente */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                                    <div className="mt-1 space-y-1 text-gray-600">
                                        <p className="text-sm">ID : <span className="font-semibold">{patient.id}</span></p>
                                        <p className="text-sm">Âge : <span className="font-semibold">{patient.age} ans</span></p>
                                        <div className="flex items-center text-sm">
                                            <Phone className="w-4 h-4 mr-2 text-blue-500" />
                                            {patient.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-start lg:items-end gap-4">
                                <div className="flex flex-col sm:flex-row gap-3">
{/* Dernière CPN */}
<div className="flex items-center px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700 border border-red-200">
  <Calendar className="w-4 h-4 mr-2 text-red-500" />
  Dernière CPN :{" "}
  {patient.lastVisit
    ? new Date(patient.lastVisit).toLocaleDateString("fr-FR")
    : "—"}
</div>

{/* Prochaine CPN */}
<div className="flex items-center px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700 border border-green-200">
  <Calendar className="w-4 h-4 mr-2 text-green-500" />
  Prochaine CPN :{" "}
  {patient.nextVisit
    ? new Date(patient.nextVisit).toLocaleDateString("fr-FR")
    : "—"}
</div>

                                </div>
                                <button
                                    disabled={!patient.dossierId}
                                    onClick={() => patient.dossierId && router.push(`/dashboard/patients/${patient.id}/dossier/${patient.dossierId}`)}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-md"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Voir dossier maternité
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2 cartes infos principales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Infos patiente */}
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                            </div>
                            <div className="space-y-4">
                                <InfoRow label="Nom complet" value={patient.name} />
                                <InfoRow label="Identifiant" value={patient.id} mono />
                                <InfoRow label="Âge" value={`${patient.age} ans`} />
                                <InfoRow label="Téléphone" value={patient.phone} />
                            </div>
                        </div>

                        {/* Suivi médical */}
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Suivi médical</h3>
                            </div>
                            <div className="space-y-4">
                                <InfoRow label="Dernière CPN" value={patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'} />
                                <InfoRow label="Prochaine CPN" value={patient.nextVisit ? new Date(patient.nextVisit).toLocaleDateString('fr-FR') : 'À planifier'} />
                                <InfoRow label="Dossier maternité" value={<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">En cours</span>} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className={`text-sm text-gray-900 font-medium ${mono ? 'font-mono bg-gray-50 px-2 py-1 rounded' : ''}`}>
                {value}
            </span>
        </div>
    );
}
