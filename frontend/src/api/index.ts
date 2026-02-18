import axios from 'axios';
import type {
  Student,
  Category,
  League,
  Game,
  Payment,
  Expense,
  ExpenseCategory,
  InstructorPayment,
  DashboardData,
  Settings,
  StudentBalance,
  GameAttendance,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard
export const getDashboard = () => api.get<DashboardData>('/dashboard').then((r) => r.data);

// Settings
export const getSettings = () => api.get<Settings>('/settings').then((r) => r.data);
export const updateSettings = (data: Partial<Settings>) =>
  api.put<Settings>('/settings', data).then((r) => r.data);

// Students
export const getStudents = () => api.get<Student[]>('/students').then((r) => r.data);
export const getStudent = (id: string) => api.get<Student>(`/students/${id}`).then((r) => r.data);
export const getStudentBalance = (id: string) =>
  api.get<StudentBalance>(`/students/${id}/balance`).then((r) => r.data);
export const createStudent = (data: Omit<Student, 'id' | 'status' | 'enrolledAt'>) =>
  api.post<Student>('/students', data).then((r) => r.data);
export const updateStudent = (id: string, data: Partial<Student>) =>
  api.put<Student>(`/students/${id}`, data).then((r) => r.data);
export const deleteStudent = (id: string) => api.delete(`/students/${id}`).then((r) => r.data);

// Categories
export const getCategories = () => api.get<Category[]>('/categories').then((r) => r.data);
export const getCategory = (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data);

// Leagues
export const getLeagues = () => api.get<League[]>('/leagues').then((r) => r.data);
export const getLeague = (id: string) =>
  api.get<League & { enrollments: Array<{ id: string; studentId: string; studentName: string; enrolledAt: string }> }>(`/leagues/${id}`).then((r) => r.data);
export const createLeague = (data: Omit<League, 'id'>) =>
  api.post<League>('/leagues', data).then((r) => r.data);
export const enrollInLeague = (leagueId: string, studentId: string) =>
  api.post(`/leagues/${leagueId}/enroll`, { studentId }).then((r) => r.data);
export const unenrollFromLeague = (leagueId: string, studentId: string) =>
  api.delete(`/leagues/${leagueId}/enroll/${studentId}`).then((r) => r.data);

// Games
export const getGames = () => api.get<Game[]>('/games').then((r) => r.data);
export const getGame = (id: string) =>
  api.get<Game & { attendances: GameAttendance[] }>(`/games/${id}`).then((r) => r.data);
export const createGame = (data: Omit<Game, 'id'>) =>
  api.post<Game>('/games', data).then((r) => r.data);
export const getEligibleStudents = (gameId: string) =>
  api.get<(Student & { attended: boolean; attendanceRecorded: boolean })[]>(
    `/games/${gameId}/eligible-students`
  ).then((r) => r.data);
export const recordAttendance = (
  gameId: string,
  studentId: string,
  attended: boolean,
  recordedBy: string
) => api.post(`/games/${gameId}/attendance`, { studentId, attended, recordedBy }).then((r) => r.data);
export const recordBulkAttendance = (
  gameId: string,
  attendances: Array<{ studentId: string; attended: boolean }>,
  recordedBy: string
) => api.post(`/games/${gameId}/attendance/bulk`, { attendances, recordedBy }).then((r) => r.data);
export const updateGame = (id: string, data: Partial<Game>) =>
  api.put<Game>(`/games/${id}`, data).then((r) => r.data);

// Payments
export const getPayments = () => api.get<Payment[]>('/payments').then((r) => r.data);
export const getStudentPayments = (studentId: string) =>
  api.get<Payment[]>(`/payments/student/${studentId}`).then((r) => r.data);
export const createPayment = (data: Omit<Payment, 'id' | 'amountUsd' | 'createdAt'>) =>
  api.post<Payment>('/payments', data).then((r) => r.data);
export const getPaymentSummary = () =>
  api.get<Record<string, { total: number; byType: Record<string, number> }>>(
    '/payments/summary/monthly'
  ).then((r) => r.data);

// Expenses
export const getExpenseCategories = () =>
  api.get<ExpenseCategory[]>('/expenses/categories').then((r) => r.data);
export const getExpenses = () => api.get<Expense[]>('/expenses').then((r) => r.data);
export const createExpense = (data: Omit<Expense, 'id' | 'amountUsd' | 'createdAt'>) =>
  api.post<Expense>('/expenses', data).then((r) => r.data);
export const getInstructorPayments = () =>
  api.get<InstructorPayment[]>('/expenses/instructor-payments').then((r) => r.data);
export const createInstructorPayment = (
  data: Omit<InstructorPayment, 'id' | 'amountUsd' | 'createdAt'>
) => api.post<InstructorPayment>('/expenses/instructor-payments', data).then((r) => r.data);
export const getExpenseSummary = () =>
  api.get<Record<string, { expenses: number; instructorPay: number; total: number }>>(
    '/expenses/summary/monthly'
  ).then((r) => r.data);

export default api;
