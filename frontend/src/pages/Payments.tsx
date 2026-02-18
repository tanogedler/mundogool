import { useEffect, useState } from 'react';
import { getPayments, getStudents, createPayment } from '../api';
import type { Payment, Student, PaymentType, PaymentMethod, Currency } from '../types';
import { Plus, X } from 'lucide-react';

const paymentTypeLabels: Record<PaymentType, string> = {
  monthly_fee: 'Mensualidad',
  league_fee: 'Pago de Liga',
  game_arbitrage: 'Pago de Juego',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash_usd: 'Efectivo (USD)',
  cash_local: 'Efectivo (Bs)',
  transfer_local: 'Pago Movil (Bs)',
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([getPayments(), getStudents()])
      .then(([p, s]) => {
        setPayments(p);
        setStudents(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pagos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={20} />
          Registrar Pago
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fecha</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Estudiante</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Método</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Monto (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{payment.paymentDate}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{payment.studentName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {paymentTypeLabels[payment.paymentType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {paymentMethodLabels[payment.paymentMethod]}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(payment.amountUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-8 text-slate-500">No se han registrado pagos</div>
        )}
      </div>

      {showModal && (
        <AddPaymentModal
          students={students}
          onClose={() => setShowModal(false)}
          onAdd={(payment) => {
            setPayments([payment, ...payments]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddPaymentModal({
  students,
  onClose,
  onAdd,
}: {
  students: Student[];
  onClose: () => void;
  onAdd: (payment: Payment) => void;
}) {
  const [form, setForm] = useState({
    studentId: students[0]?.id || '',
    amountOriginal: '',
    currency: 'USD' as Currency,
    exchangeRate: '1',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash_usd' as PaymentMethod,
    paymentType: 'monthly_fee' as PaymentType,
    rateSource: 'manual',
    referenceId: null as string | null,
    referenceNumber: '', 
    recordedBy: 'user-secretary',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payment = await createPayment({
        ...form,
        amountOriginal: parseFloat(form.amountOriginal),
        exchangeRate: parseFloat(form.exchangeRate),
      });
      onAdd(payment);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const calculatedUsd =
    form.currency === 'USD'
      ? parseFloat(form.amountOriginal) || 0
      : (parseFloat(form.amountOriginal) || 0) / (parseFloat(form.exchangeRate) || 1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Registrar Pago</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {students
                .filter((s) => s.status === 'active')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Pago</label>
              <select
                value={form.paymentType}
                onChange={(e) => setForm({ ...form, paymentType: e.target.value as PaymentType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="monthly_fee">Mensualidad</option>
                <option value="league_fee">Pago de Liga</option>
                <option value="game_arbitrage">Pago de Juego</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const currency = e.target.value as Currency;
                  setForm({
                    ...form,
                    currency,
                    paymentMethod: currency === 'USD' ? 'cash_usd' : 'cash_local',
                    exchangeRate: currency === 'USD' ? '1' : form.exchangeRate,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="USD">USD</option>
                <option value="LOCAL">Bs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {form.currency === 'USD' ? (
                  <>
                  <option value="transfer_local">Pago Movil</option>
                    <option value="cash_usd">Efectivo</option>
                    
                  </>
                ) : (
                  <>
                    <option value="transfer_local">Pago Movil</option>
                    <option value="cash_local">Efectivo</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amountOriginal}
                onChange={(e) => setForm({ ...form, amountOriginal: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            {form.currency === 'LOCAL' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tasa de Cambio (Bs/USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.exchangeRate}
                  onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            )}
          </div>

          {form.currency === 'LOCAL' && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <span className="text-slate-500">Equivalencia en USD: </span>
              <span className="font-medium">${calculatedUsd.toFixed(2)}</span>
            </div>
          )}
          <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Número de Referencia</label>
  <input
    type="text"
    value={form.referenceNumber}
    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
    placeholder="Referencia de pago"
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
  />
</div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
