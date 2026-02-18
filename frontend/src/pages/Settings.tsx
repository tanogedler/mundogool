import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api';


export default function SettingsPage() {
  // Removed unused settings state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    monthlyFeeUsd: '',
    localCurrencyCode: '',
  });

  useEffect(() => {
    getSettings()
      .then((s) => {
        setForm({
          monthlyFeeUsd: s.monthlyFeeUsd.toString(),
          localCurrencyCode: s.localCurrencyCode,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        monthlyFeeUsd: parseFloat(form.monthlyFeeUsd),
        localCurrencyCode: form.localCurrencyCode,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Configuración</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Configuración de Tarifas</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto Mensual (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.monthlyFeeUsd}
              onChange={(e) => setForm({ ...form, monthlyFeeUsd: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <p className="text-sm text-slate-500 mt-1">
              Tasa mensual predeterminada cobrada a cada estudiante.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código de Moneda Local
            </label>
            <input
              type="text"
              maxLength={3}
              value={form.localCurrencyCode}
              onChange={(e) =>
                setForm({ ...form, localCurrencyCode: e.target.value.toUpperCase() })
              }
              placeholder="e.g., VES, ARS, COP"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <p className="text-sm text-slate-500 mt-1">
              El código de moneda local para fines de visualización.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl mt-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Acerca de</h2>
        <p className="text-sm text-slate-600">
          Academia de Futbol Mundo Gool - Sistema de Gestión de gastos e Ingresos
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Un sistema simple para rastrear pagos de estudiantes, gastos y asistencia a juegos.
        </p>
      </div>
    </div>
  );
}
