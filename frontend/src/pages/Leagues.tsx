import { useEffect, useState } from 'react';
import { getLeagues, getCategories, getStudents, createLeague, enrollInLeague, unenrollFromLeague, getLeague } from '../api';
import type { League, Category, Student } from '../types';
import { Trophy, Plus, X, Users, ChevronRight } from 'lucide-react';

export default function Leagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLeague, setShowAddLeague] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getLeagues(), getCategories(), getStudents()])
      .then(([l, c, s]) => {
        setLeagues(l);
        setCategories(c);
        setStudents(s.filter(st => st.status === 'active'));
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshLeagues = async () => {
    const l = await getLeagues();
    setLeagues(l);
  };

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
        <h1 className="text-2xl font-bold text-slate-800">Ligas</h1>
        <button
          onClick={() => setShowAddLeague(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={20} />
          Crear Liga
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league) => (
          <div
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">{league.name}</h3>
                <p className="text-sm text-slate-500">{league.year}</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <Trophy className="text-amber-600" size={20} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría</span>
                <span className="font-medium">{league.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Costo</span>
                <span className="font-medium">{formatCurrency(league.feeAmountUsd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inscritos</span>
                <span className="font-medium">{league.enrollmentCount} estudiantes</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
              <ChevronRight className="text-slate-400" size={20} />
            </div>
          </div>
        ))}
      </div>

      {leagues.length === 0 && (
        <div className="text-center py-12 text-slate-500">No hay ligas creadas</div>
      )}



      {showAddLeague && (
        <AddLeagueModal
          categories={categories}
          onClose={() => setShowAddLeague(false)}
          onAdd={(league) => {
            setLeagues([...leagues, league]);
            setShowAddLeague(false);
          }}
        />
      )}

      {selectedLeague && (
        <LeagueDetailModal
          leagueId={selectedLeague}
          students={students}
          onClose={() => setSelectedLeague(null)}
          onUpdate={refreshLeagues}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function AddLeagueModal({
  categories,
  onClose,
  onAdd,
}: {
  categories: Category[];
  onClose: () => void;
  onAdd: (league: League) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    year: new Date().getFullYear(),
    categoryId: categories[0]?.id || '',
    feeAmountUsd: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const league = await createLeague({
        ...form,
        feeAmountUsd: parseFloat(form.feeAmountUsd),
      });
      onAdd(league);
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
          <h2 className="text-lg font-semibold">Agregar Liga</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Liga</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre de la liga"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
              <input
                type="number"
                required
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Costo (USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.feeAmountUsd}
              onChange={(e) => setForm({ ...form, feeAmountUsd: e.target.value })}
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
              {saving ? 'Guardando...' : 'Crear Liga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeagueDetailModal({
  leagueId,
  students,
  onClose,
  onUpdate,
  formatCurrency,
}: {
  leagueId: string;
  students: Student[];
  onClose: () => void;
  onUpdate: () => void;
  formatCurrency: (n: number) => string;
}) {
  const [league, setLeague] = useState<(League & { enrollments: Array<{ id: string; studentId: string; studentName: string; enrolledAt: string }> }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
  const loadLeague = async () => {
    setLoading(true);
    const data = await getLeague(leagueId);
    setLeague(data);
    setLoading(false);
  };
  loadLeague();
}, [leagueId]);

const refreshLeague = async () => {
  const data = await getLeague(leagueId);
  setLeague(data);
  onUpdate();
};



  const handleEnroll = async (studentId: string) => {
    setEnrolling(true);
    try {
      await enrollInLeague(leagueId, studentId);
      await refreshLeague();
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    try {
      await unenrollFromLeague(leagueId, studentId);
      await refreshLeague();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
        </div>
      </div>
    );
  }
  if (!league) {
  return null;
}
const enrolledStudentIds = league?.enrollments?.map((e) => e.studentId) || [];
const availableStudents = students.filter(
  (s) => !enrolledStudentIds.includes(s.id) && s.categoryId === league.categoryId
);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold">{league.name}</h2>
            <p className="text-sm text-slate-500">{league.categoryName} • {league.year}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Costo de la Liga</span>
              <span className="font-medium">{formatCurrency(league.feeAmountUsd)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-800 flex items-center gap-2">
              <Users size={18} />
              Enrolled Students ({league.enrollments?.length || 0})
            </h3>
            <button
              onClick={() => setShowEnroll(!showEnroll)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showEnroll ? 'Cancel' : '+ Add Student'}
            </button>
          </div>

          {showEnroll && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Selecciona un estudiante para inscribir:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-slate-500">Todos los estudiantes ya están inscritos</p>
                ) : (
                  availableStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleEnroll(student.id)}
                      disabled={enrolling}
                      className="w-full text-left px-3 py-2 text-sm bg-white rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      {student.firstName} {student.lastName}
                      <span className="text-slate-400 ml-2">({student.categoryName})</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {league.enrollments?.length === 0 ? (
              <p className="text-center py-4 text-slate-500">No hay estudiantes inscritos aún</p>
            ) : (
              league.enrollments?.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800">{enrollment.studentName}</p>
                    <p className="text-xs text-slate-500">Inscrito: {enrollment.enrolledAt}</p>
                  </div>
                  <button
                    onClick={() => handleUnenroll(enrollment.studentId)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}