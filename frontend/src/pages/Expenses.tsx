import { useEffect, useState } from 'react';
import { getExpenses, getExpenseCategories, createExpense } from '../api';
import type { Expense, ExpenseCategory, Currency } from '../types';
import { Plus, X } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([getExpenses(), getExpenseCategories()])
      .then(([e, c]) => {
        setExpenses(e);
        setCategories(c);
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
        <h1 className="text-2xl font-bold text-slate-800">Gastos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={20} />
          Agregar Gasto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fecha</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Descripción</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categoría</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Beneficiario</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Monto (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{expense.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{expense.description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {expense.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{expense.payee}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(expense.amountUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && (
          <div className="text-center py-8 text-slate-500">No hay gastos registrados</div>
        )}
      </div>

      {showModal && (
        <AddExpenseModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onAdd={(expense) => {
            setExpenses([expense, ...expenses]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddExpenseModal({
  categories,
  onClose,
  onAdd,
}: {
  categories: ExpenseCategory[];
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}) {
  const [form, setForm] = useState({
    categoryId: categories[0]?.id || '',
    description: '',
    amountOriginal: '',
    currency: 'USD' as Currency,
    exchangeRate: '1',
    date: new Date().toISOString().split('T')[0],
    payee: '',
    recordedBy: 'user-admin',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const expense = await createExpense({
        ...form,
        amountOriginal: parseFloat(form.amountOriginal),
        exchangeRate: parseFloat(form.exchangeRate),
      });
      onAdd(expense);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Agregar Gasto</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiario</label>
            <input
              type="text"
              required
              value={form.payee}
              onChange={(e) => setForm({ ...form, payee: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="USD">USD</option>
                <option value="LOCAL">Bs</option>
              </select>
            </div>
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
              {saving ? 'Guardando...' : 'Agregar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
