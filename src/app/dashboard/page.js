"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Timeline from '@/components/ui/Timeline';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserPlus,
    faStethoscope,
    faBaby,
    faCalendarPlus,
    faUsers,
    faUserClock,
    faHospital,
    faCalendarAlt,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
    // Sample data for statistics
    const stats = [
        {
            title: 'Nouvelles patientes',
            value: '24',
            icon: faUserPlus,
            color: 'var(--primary)',
            increasePct: 12,
            period: 'mois dernier'
        },
        {
            title: 'CPN réalisées',
            value: '86',
            icon: faStethoscope,
            color: 'var(--secondary)',
            increasePct: 8,
            period: 'mois dernier'
        },
        {
            title: 'Accouchements',
            value: '15',
            icon: faBaby,
            color: 'var(--secondary)',
            increasePct: -3,
            period: 'mois dernier'
        },
        {
            title: 'Consultations planifiées',
            value: '38',
            icon: faCalendarPlus,
            color: 'var(--primary)',
            increasePct: 16,
            period: 'mois dernier'
        }
    ];

    // Sample data for upcoming appointments
    const upcomingAppointments = [
        {
            patient: { id: '123', name: 'Mme Afiavi HOUNSA' },
            appointmentType: 'CPN - 2ème trimestre',
            date: '2025-06-20',
            time: '09:30',
            status: 'upcoming'
        },
        {
            patient: { id: '456', name: 'Mme Blandine AGOSSOU' },
            appointmentType: 'CPN - 1er trimestre',
            date: '2025-06-21',
            time: '10:15',
            status: 'upcoming'
        },
        {
            patient: { id: '789', name: 'Mme Colette BOCOVO' },
            appointmentType: 'Suivi post-accouchement',
            date: '2025-06-22',
            time: '14:00',
            status: 'upcoming'
        },
        {
            patient: { id: '101', name: 'Mme Danielle LOKONON' },
            appointmentType: 'CPN - 3ème trimestre',
            date: '2025-06-23',
            time: '11:30',
            status: 'upcoming'
        }
    ];

    // Date du jour en français
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <DashboardLayout title="Tableau de bord">
            {/* Header moderne */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-1">Tableau de bord</h1>
                    <div className="text-gray-500 text-base mb-1">Bienvenue sur la plateforme MaterniBénin</div>
                    <div className="text-xs text-gray-400">{today.charAt(0).toUpperCase() + today.slice(1)}</div>
                </div>
            </div>

            {/* Statistics Cards améliorées */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border-t-4" style={{ borderTopColor: stat.color }}>
                        <div className="mb-2">
                            <FontAwesomeIcon icon={stat.icon} className="w-8 h-8" style={{ color: stat.color }} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600 mb-1">{stat.title}</div>
                        <div className="text-xs text-gray-400">
                            {stat.increasePct >= 0 ? '+' : ''}{stat.increasePct}% <span className="ml-1">{stat.period}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <div className="lg:col-span-2">
                    <DashboardWidget
                        title="Activités mensuelles"
                        subtitle="Aperçu des CPN, accouchements et planification familiale"
                    >
                        <div className="h-80 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <DashboardChart />
                        </div>
                    </DashboardWidget>
                </div>


                {/* Timeline globale */}
                <Timeline />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Prochaines CPN améliorées */}
                <div className="lg:col-span-2">
                    <DashboardWidget
                        title="Prochaines CPN"
                        subtitle="Consultations prénatales à venir"
                        actions={[
                            {
                                label: 'Voir toutes les CPN',
                                icon: faCalendarAlt,
                                onClick: () => console.log('Voir toutes les CPN')
                            }
                        ]}
                        footerContent={
                            <Link
                                href="/dashboard/cpn"
                                className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                                Voir toutes les consultations prévues →
                            </Link>
                        }
                    >
                        <div className="space-y-4">
                            {upcomingAppointments.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">Aucun rendez-vous à venir</div>
                            ) : (
                                upcomingAppointments.map((appointment, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                                                {appointment.patient.name.split(' ').map(p => p.charAt(0)).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{appointment.patient.name}</div>
                                                <div className="text-xs text-gray-500">{appointment.appointmentType}</div>
                                                <div className="text-xs text-gray-400">{new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : appointment.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{appointment.status === 'upcoming' ? 'À venir' : appointment.status === 'done' ? 'Terminé' : 'Inconnu'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DashboardWidget>
                </div>

                {/* Summary Statistics */}
                <div>
                    <DashboardWidget title="Aperçu des statistiques">
                        <div className="space-y-4">              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-primary mr-3" />
                                <span className="text-text-primary">Total patientes</span>
                            </div>
                            <span className="font-medium text-text-primary">247</span>
                        </div>

                            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faUserClock} className="w-5 h-5 text-secondary mr-3" />
                                    <span className="text-text-primary">CPN du mois</span>
                                </div>
                                <span className="font-medium text-text-primary">86</span>
                            </div>

                            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faBaby} className="w-5 h-5 text-secondary mr-3" />
                                    <span className="text-text-primary">Naissances</span>
                                </div>
                                <span className="font-medium text-text-primary">15</span>
                            </div>

                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faHospital} className="w-5 h-5 text-primary mr-3" />
                                    <span className="text-text-primary">Transferts</span>
                                </div>
                                <span className="font-medium text-text-primary">3</span>
                            </div>
                        </div>
                    </DashboardWidget>

                    <div className="mt-6">
                        <Button
                            href="/dashboard/rapports"
                            variant="outline"
                            fullWidth
                            icon={<FontAwesomeIcon icon={faCalendarAlt} />}
                        >
                            Générer un rapport mensuel
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
