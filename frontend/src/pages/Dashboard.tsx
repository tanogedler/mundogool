import { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import type { DashboardData } from '../types';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error cargando página de inicio: {error}
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const stats = [
    {
      label: 'Estudiantes Activos',
      value: data.activeStudents,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Ingresos Mensuales',
      value: formatCurrency(data.monthlyIncome),
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Gastos Mensuales',
      value: formatCurrency(data.monthlyExpenses),
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
/*     {
      label: 'Saldo Pendiente',
      value: formatCurrency(data.outstandingBalance),
      icon: AlertCircle,
      color: data.outstandingBalance > 0 ? 'bg-red-500' : 'bg-slate-500',
    }, */
  ];

  return (
  <div className="relative min-h-full">
    {/* Watermark */}
    <div 
      className="absolute inset-0 flex items-start justify-center pt-16 pointer-events-none opacity-10"
      aria-hidden="true"
    >
      <img src="/cropped_logo.png" alt="" className="w-[600px] h-[600px] object-contain" />
    </div>
    
    <div className="relative z-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inicio</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-semibold text-slate-800">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ingresos Netos</h2>
          <div className="flex items-center gap-4">
            <span
              className={`text-3xl font-bold ${
                data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(data.netIncome)}
            </span>
            <span className="text-slate-500">Mes actual</span>
          </div>
        </div> 


        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Settings</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Pago Mensual:</span>
              <span className="font-medium">{formatCurrency(data.settings.monthlyFeeUsd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Local Currency:</span>
              <span className="font-medium">{data.settings.localCurrencyCode}</span>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}
