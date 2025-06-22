"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatCard = ({ title, value, icon, color, increasePct, period }) => {
    // Détermine la classe de couleur à utiliser (primary ou secondary)
    const getColorClasses = () => {
        if (color === '#1E88E5' || color === 'var(--primary)') {
            return {
                border: 'border-l-primary',
                bg: 'bg-primary/10',
                text: 'text-primary'
            };
        } else if (color === '#4CAF50' || color === 'var(--secondary)') {
            return {
                border: 'border-l-secondary',
                bg: 'bg-secondary/10',
                text: 'text-secondary'
            };
        } else {
            // Fallback au style inline
            return {
                border: '',
                bg: '',
                text: ''
            };
        }
    };

    const colorClasses = getColorClasses();

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses.border}`}
            style={colorClasses.border ? {} : { borderLeftColor: color }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-text-primary">{value}</h3>

                    {increasePct && (
                        <div className="flex items-center mt-2">
                            <span className={`text-xs font-medium ${increasePct >= 0 ? 'text-secondary' : 'text-red-500'}`}>
                                {increasePct >= 0 ? '+' : ''}{increasePct}%
                            </span>
                            <span className="text-xs text-text-secondary ml-1">vs {period}</span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-full ${colorClasses.bg}`}
                    style={!colorClasses.bg ? { backgroundColor: `${color}20` } : {}}>
                    <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${colorClasses.text}`}
                        style={!colorClasses.text ? { color: color } : {}} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
