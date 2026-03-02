import { useEffect, useState } from 'react';
import { getStudents, getCategories, createStudent, getStudentBalance, updateStudent, deleteStudent } from '../api';
import type { Student, Category, StudentBalance } from '../types';
import { Plus, Search, X, ChevronRight } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [balance, setBalance] = useState<StudentBalance | null>(null);

  useEffect(() => {
    Promise.all([getStudents(), getCategories()])
      .then(([s, c]) => {
        setStudents(s);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.status === 'active' &&
      (`${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    const bal = await getStudentBalance(student.id);
    setBalance(bal);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Estudiantes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={20} />
          Agregar Estudiante
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar Estudiante o Representante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Edad</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categoría</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Representante</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleViewStudent(student)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">
                      {student.firstName} {student.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{calculateAge(student.birthdate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.guardianName}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="text-slate-400" size={20} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-slate-500">No hay estudiantes inscritos</div>
        )}
      </div>

    {selectedStudent && (
      <StudentDetailModal
        student={selectedStudent}
        balance={balance}
        categories={categories}
        onClose={() => {
          setSelectedStudent(null);
          setBalance(null);
        }}
        onUpdate={(updated) => {
          setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
          setSelectedStudent(updated);
        }}
        onDelete={(id) => {
          setStudents(students.filter((s) => s.id !== id));
        }}
        formatCurrency={formatCurrency}
        calculateAge={calculateAge}
      />
    )}

      {showModal && (
        <AddStudentModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onAdd={(student) => {
            setStudents([...students, student]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function StudentDetailModal({
  student,
  balance,
  categories,
  onClose,
  onUpdate,
  onDelete,
  formatCurrency,
  calculateAge,
}: {
  student: Student;
  balance: StudentBalance | null;
  categories: Category[];
  onClose: () => void;
  onUpdate: (updated: Student) => void;
  onDelete: (id: string) => void;
  formatCurrency: (n: number) => string;
  calculateAge: (d: string) => number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    birthdate: student.birthdate,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    guardianEmail: student.guardianEmail,
    categoryId: student.categoryId,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await updateStudent(student.id, editForm);
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}? This will also delete all their payments, attendance records, and league enrollments.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      onDelete(student.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">
            {student.firstName} {student.lastName}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={editForm.birthdate}
                    onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del representante</label>
                <input
                  type="text"
                  value={editForm.guardianName}
                  onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={editForm.guardianPhone}
                    onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={editForm.guardianEmail}
                    onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Edad</span>
                  <p className="font-medium">{calculateAge(student.birthdate)} años</p>
                </div>
                <div>
                  <span className="text-slate-500">Categoría</span>
                  <p className="font-medium">{student.categoryName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Representante</span>
                  <p className="font-medium">{student.guardianName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Teléfono</span>
                  <p className="font-medium">{student.guardianPhone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Correo electrónico</span>
                  <p className="font-medium">{student.guardianEmail}</p>
                </div>
              </div>

              {balance && (
                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-slate-800 mb-3">Resumen de Balance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pagos Mensuales</span>
                      <span>{formatCurrency(balance.expectedMonthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pagos de Liga</span>
                      <span>{formatCurrency(balance.expectedLeagues)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pagos de Juegos</span>
                      <span>{formatCurrency(balance.expectedGames)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-slate-200 pt-2">
                      <span>Total Esperado</span>
                      <span>{formatCurrency(balance.totalExpected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pagado</span>
                      <span className="text-green-600">{formatCurrency(balance.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-slate-200 pt-2">
                      <span>Balance</span>
                      <span className={balance.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(balance.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddStudentModal({
  categories,
  onClose,
  onAdd,
}: {
  categories: Category[];
  onClose: () => void;
  onAdd: (student: Student) => void;
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthdate: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    categoryId: categories[0]?.id || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const student = await createStudent(form);
      onAdd(student);
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
          <h2 className="text-lg font-semibold">Agregar Estudiante</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                required
                value={form.birthdate}
                onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Representante</label>
            <input
              type="text"
              required
              value={form.guardianName}
              onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="tel"
                required
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={form.guardianEmail}
                onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
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
              {saving ? 'Guardando...' : 'Agregar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
