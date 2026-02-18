import { useEffect, useState } from 'react';
import { getGames, getLeagues, getStudents, createGame, updateGame } from '../api';
import type { Game, League, Student } from '../types';
import { CalendarDays, MapPin, Plus, X } from 'lucide-react';

export default function Games() {
const [games, setGames] = useState<Game[]>([]);
const [leagues, setLeagues] = useState<League[]>([]);
const [loading, setLoading] = useState(true);
const [showAddGame, setShowAddGame] = useState(false);
const [students, setStudents] = useState<Student[]>([]);
const [selectedGame, setSelectedGame] = useState<Game | null>(null);

useEffect(() => {
  Promise.all([getGames(), getLeagues(), getStudents()])
    .then(([g, l, s]) => {
      setGames(g);
      setLeagues(l);
      setStudents(s.filter((st) => st.status === 'active'));
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

  const upcomingGames = games.filter((g) => new Date(g.date) >= new Date());
  const pastGames = games.filter((g) => new Date(g.date) < new Date());

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
  <h1 className="text-2xl font-bold text-slate-800">Juegos</h1>
  <button
    onClick={() => setShowAddGame(true)}
    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
  >
    <Plus size={20} />
    Agregar Juego
  </button>
</div>

      {upcomingGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Upcoming Games</h2>
          <div className="space-y-3">
            {upcomingGames.map((game) => (
  <GameCard
    key={game.id}
    game={game}
    formatCurrency={formatCurrency}
    onClick={() => setSelectedGame(game)}
  />
))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Past Games</h2>
        {pastGames.length > 0 ? (
          <div className="space-y-3">
            {pastGames.map((game) => (
  <GameCard
    key={game.id}
    game={game}
    formatCurrency={formatCurrency}
    isPast
    onClick={() => setSelectedGame(game)}
  />
))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">No past games</div>
        )}
      </div>
      {showAddGame && (
        <AddGameModal
          leagues={leagues}
          onClose={() => setShowAddGame(false)}
          onAdd={(game) => {
            setGames([game, ...games]);
            setShowAddGame(false);
          }}
        />
      )}
      {selectedGame && (
  <GameDetailModal
    game={selectedGame}
    students={students}
    onClose={() => setSelectedGame(null)}
    onUpdate={(updated) => {
      setGames(games.map((g) => (g.id === updated.id ? updated : g)));
    }}
  />
)}
    </div>
  );
}

function GameCard({
  game,
  formatCurrency,
  isPast = false,
  onClick,
}: {
  game: Game;
  formatCurrency: (n: number) => string;
  isPast?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:border-slate-300 transition-colors ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-lg">
            <CalendarDays className="text-slate-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
  vs {game.opponent}
  {game.goalsFor !== null && game.goalsAgainst !== null && (
    <span className={`ml-2 ${
      game.goalsFor > game.goalsAgainst 
        ? 'text-green-600' 
        : game.goalsFor < game.goalsAgainst 
          ? 'text-red-600' 
          : 'text-slate-500'
    }`}>
      ({game.goalsFor} - {game.goalsAgainst})
    </span>
  )}
</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
              <span>{new Date(game.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {game.location}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              game.gameType === 'liga'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {game.gameType === 'liga' ? 'Liga' : 'Amistoso'}
          </span>
          <span className="text-sm text-slate-500">{game.categoryName}</span>
          <span className="text-sm font-medium text-slate-800">
            {formatCurrency(game.arbitrageFeeUsd)} / jugador
          </span>
        </div>
      </div>
    </div>
  );
}

function AddGameModal({
  leagues,
  onClose,
  onAdd,
}: {
  leagues: League[];
  onClose: () => void;
  onAdd: (game: Game) => void;
}) {
  const [form, setForm] = useState({
    gameType: 'liga' as 'liga' | 'amistoso',
    leagueId: leagues[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    location: '',
    arbitrageFeeUsd: '',
    goalsFor: '',
    goalsAgainst: '',
    goals: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const game = await createGame({
        ...form,
        leagueId: form.gameType === 'liga' ? form.leagueId : '',
        arbitrageFeeUsd: parseFloat(form.arbitrageFeeUsd),
        goalsFor: null,
        goalsAgainst: null,
        goals: [],
      });
      onAdd(game);
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
          <h2 className="text-lg font-semibold">Add Game</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Game Type</label>
            <select
              value={form.gameType}
              onChange={(e) => setForm({ ...form, gameType: e.target.value as 'liga' | 'amistoso' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="liga">Liga</option>
              <option value="amistoso">Amistoso</option>
            </select>
          </div>

          {form.gameType === 'liga' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">League</label>
              <select
                value={form.leagueId}
                onChange={(e) => setForm({ ...form, leagueId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.categoryName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opponent</label>
            <input
              type="text"
              required
              value={form.opponent}
              onChange={(e) => setForm({ ...form, opponent: e.target.value })}
              placeholder="e.g., Club Deportivo Norte"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Estadio Municipal"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Arbitrage Fee (USD per player)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.arbitrageFeeUsd}
              onChange={(e) => setForm({ ...form, arbitrageFeeUsd: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function GameDetailModal({
  game,
  students,
  onClose,
  onUpdate,
}: {
  game: Game;
  students: Student[];
  onClose: () => void;
  onUpdate: (updated: Game) => void;
}) {
  const [goalsFor, setGoalsFor] = useState<string>(game.goalsFor?.toString() || '');
  const [goalsAgainst, setGoalsAgainst] = useState<string>(game.goalsAgainst?.toString() || '');
  const [goals, setGoals] = useState<Array<{ studentId: string; minute: number }>>(
    game.goals?.map((g) => ({ studentId: g.studentId, minute: g.minute })) || []
  );
  const [saving, setSaving] = useState(false);

  const addGoal = () => {
    setGoals([...goals, { studentId: students[0]?.id || '', minute: 0 }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: 'studentId' | 'minute', value: string | number) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

const handleSave = async () => {
  setSaving(true);
  try {
    const updated = await updateGame(game.id, {
      goalsFor: goalsFor ? parseInt(goalsFor) : null,
      goalsAgainst: goalsAgainst ? parseInt(goalsAgainst) : null,
      goals: goals.map((g, i) => ({
        id: `goal-${game.id}-${i}`,
        studentId: g.studentId,
        minute: g.minute,
      })),
    });
    onUpdate(updated);
    onClose();
  } catch (err) {
    console.error(err);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold">vs {game.opponent}</h2>
            <p className="text-sm text-slate-500">{new Date(game.date).toLocaleDateString()} • {game.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Final Score</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Us</label>
                <input
                  type="number"
                  min="0"
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-center text-xl font-bold"
                />
              </div>
              <span className="text-2xl text-slate-400 mt-5">-</span>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Them</label>
                <input
                  type="number"
                  min="0"
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-center text-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Goal scorers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Goal Scorers</label>
              <button
                type="button"
                onClick={addGoal}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">No goals recorded</p>
            ) : (
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={goal.studentId}
                      onChange={(e) => updateGoal(index, 'studentId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={goal.minute}
                        onChange={(e) => updateGoal(index, 'minute', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm text-center"
                      />
                      <span className="text-sm text-slate-500">'</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}