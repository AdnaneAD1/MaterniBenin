"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUserClock } from '@fortawesome/free-solid-svg-icons';

const AppointmentCard = ({
    patient,
    appointmentType,
    date,
    time,
    status = 'upcoming', // 'upcoming', 'completed', 'missed', 'canceled'
    onClick
}) => {
    // Status styles
    const statusStyles = {
        upcoming: {
            bg: 'bg-primary/10',
            text: 'text-primary-dark',
            border: 'border-primary/20'
        },
        completed: {
            bg: 'bg-secondary/10',
            text: 'text-secondary-dark',
            border: 'border-secondary/20'
        },
        missed: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        },
        canceled: {
            bg: 'bg-gray-100',
            text: 'text-text-secondary',
            border: 'border-gray-200'
        }
    };

    const currentStyles = statusStyles[status] || statusStyles.upcoming;

    // Format date for display (assuming date is a string like "2023-06-15")
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    return (
        <div
            className={`border ${currentStyles.border} rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium text-text-primary">{patient.name}</h4>
                    <p className="text-sm text-text-secondary">{appointmentType}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${currentStyles.bg} ${currentStyles.text}`}>
                    {status === 'upcoming' && 'À venir'}
                    {status === 'completed' && 'Terminé'}
                    {status === 'missed' && 'Manqué'}
                    {status === 'canceled' && 'Annulé'}
                </div>
            </div>

            <div className="mt-3 flex items-center text-sm text-text-secondary">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                {formattedDate}
            </div>

            <div className="mt-1 flex items-center text-sm text-text-secondary">
                <FontAwesomeIcon icon={faUserClock} className="mr-2" />
                {time}
            </div>
        </div>
    );
};

export default AppointmentCard;
