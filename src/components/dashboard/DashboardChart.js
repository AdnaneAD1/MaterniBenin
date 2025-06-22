import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Données fictives d'activité mensuelle
const data = [
  { mois: 'Jan', CPN: 20, Accouchements: 6, PF: 3 },
  { mois: 'Fév', CPN: 32, Accouchements: 9, PF: 6 },
  { mois: 'Mar', CPN: 25, Accouchements: 7, PF: 4 },
  { mois: 'Avr', CPN: 30, Accouchements: 8, PF: 5 },
  { mois: 'Mai', CPN: 28, Accouchements: 10, PF: 7 },
  { mois: 'Juin', CPN: 35, Accouchements: 12, PF: 8 },
];

export default function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mois" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="CPN" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Accouchements" stroke="#f59e42" strokeWidth={3} />
        <Line type="monotone" dataKey="PF" stroke="#10b981" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
