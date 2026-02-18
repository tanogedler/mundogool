// Sample data for development/testing
// In production, replace with database queries

import {
  User,
  Category,
  Student,
  League,
  LeagueEnrollment,
  Game,
  GameAttendance,
  Payment,
  ExpenseCategory,
  Expense,
  InstructorPayment,
  Settings,
} from '../types';

// Helper to generate IDs
const genId = () => Math.random().toString(36).substring(2, 11);

export const settings: Settings = {
  monthlyFeeUsd: 50,
  defaultCurrency: 'LOCAL',
  localCurrencyCode: 'VES',
};

export const users: User[] = [
  {
    id: 'user-admin',
    name: 'Director Admin',
    email: 'admin@academy.com',
    role: 'admin',
    passwordHash: 'hashed_password_here',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-secretary',
    name: 'Maria Secretary',
    email: 'secretary@academy.com',
    role: 'secretary',
    passwordHash: 'hashed_password_here',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-instructor-1',
    name: 'Carlos Instructor',
    email: 'carlos@academy.com',
    role: 'instructor',
    passwordHash: 'hashed_password_here',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const categories: Category[] = [
  { id: 'cat-sub6', name: 'Sub-6', minAge: 4, maxAge: 6 },
  { id: 'cat-sub8', name: 'Sub-8', minAge: 6, maxAge: 8 },
  { id: 'cat-sub10', name: 'Sub-10', minAge: 8, maxAge: 10 },
  { id: 'cat-sub12', name: 'Sub-12', minAge: 10, maxAge: 12 },
  { id: 'cat-sub14', name: 'Sub-14', minAge: 12, maxAge: 14 },
  { id: 'cat-sub16', name: 'Sub-16', minAge: 14, maxAge: 16 },
  { id: 'cat-sub18', name: 'Sub-18', minAge: 16, maxAge: 18 },
];

export const students: Student[] = [
  {
    id: 'stu-001',
    firstName: 'Pedro',
    lastName: 'González',
    birthdate: '2015-03-15',
    guardianName: 'Juan González',
    guardianPhone: '+58-412-1234567',
    guardianEmail: 'juan.gonzalez@email.com',
    categoryId: 'cat-sub10',
    enrolledAt: '2024-02-01',
    status: 'active',
  },
  {
    id: 'stu-002',
    firstName: 'Luis',
    lastName: 'Martínez',
    birthdate: '2014-07-22',
    guardianName: 'Ana Martínez',
    guardianPhone: '+58-414-7654321',
    guardianEmail: 'ana.martinez@email.com',
    categoryId: 'cat-sub12',
    enrolledAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 'stu-003',
    firstName: 'Sofia',
    lastName: 'Rodríguez',
    birthdate: '2016-11-08',
    guardianName: 'Carlos Rodríguez',
    guardianPhone: '+58-416-9876543',
    guardianEmail: 'carlos.rodriguez@email.com',
    categoryId: 'cat-sub8',
    enrolledAt: '2024-03-01',
    status: 'active',
  },
];

export const leagues: League[] = [

];

export const leagueEnrollments: LeagueEnrollment[] = [
  {
    id: 'enroll-001',
    studentId: 'stu-001',
    leagueId: 'league-2025-sub10',
    enrolledAt: '2025-01-10',
  },
  {
    id: 'enroll-002',
    studentId: 'stu-002',
    leagueId: 'league-2025-sub12',
    enrolledAt: '2025-01-10',
  },
];

export const games: Game[] = [
  {
    id: 'game-001',
    leagueId: 'league-2025-sub10',
    date: '2025-02-15',
    opponent: 'Club Deportivo Norte',
    location: 'Estadio Municipal',
    gameType: 'liga',
    arbitrageFeeUsd: 5,
    goalsFor: 3,
    goalsAgainst: 2,
    goals: [
      { id: 'goal-001', studentId: 'stu-001', minute: 15 },
      { id: 'goal-002', studentId: 'stu-001', minute: 30 },
      { id: 'goal-003', studentId: 'stu-001', minute: 45 },
    ],
  },
  {
    id: 'game-002',
    leagueId: 'league-2025-sub10',
    date: '2025-02-01',
    opponent: 'Academia Sur',
    location: 'Cancha Local',
    gameType: 'amistoso',
    arbitrageFeeUsd: 3,
    goalsFor: 1,
    goalsAgainst: 1,
    goals: [
      { id: 'goal-004', studentId: 'stu-001', minute: 20 },
    ],
  },
];

export const gameAttendances: GameAttendance[] = [
  {
    id: 'att-001',
    studentId: 'stu-001',
    gameId: 'game-001',
    attended: true,
    recordedBy: 'user-instructor-1',
    recordedAt: '2025-02-15T10:00:00Z',
  },
  {
    id: 'att-002',
    studentId: 'stu-001',
    gameId: 'game-002',
    attended: true,
    recordedBy: 'user-instructor-1',
    recordedAt: '2025-02-01T10:00:00Z',
  },
];

export const payments: Payment[] = [
  {
    id: 'pay-001',
    studentId: 'stu-001',
    amountUsd: 50,
    amountOriginal: 1850,
    currency: 'LOCAL',
    exchangeRate: 37,
    rateSource: 'manual',
    paymentDate: '2025-01-05',
    paymentMethod: 'cash_local',
    paymentType: 'monthly_fee',
    referenceId: null,
    referenceNumber: '',
    recordedBy: 'user-secretary',
    notes: 'January 2025 monthly fee',
    createdAt: '2025-01-05T14:30:00Z',
  },
  {
    id: 'pay-002',
    studentId: 'stu-001',
    amountUsd: 100,
    amountOriginal: 100,
    currency: 'USD',
    exchangeRate: 1,
    rateSource: 'manual',
    paymentDate: '2025-01-10',
    paymentMethod: 'cash_usd',
    paymentType: 'league_fee',
    referenceId: 'league-2025-sub10',
    referenceNumber: '123456789',
    recordedBy: 'user-secretary',
    notes: 'League enrollment fee',
    createdAt: '2025-01-10T09:00:00Z',
  },
];

export const expenseCategories: ExpenseCategory[] = [
  { id: 'expcat-equipment', name: 'Equipamiento' },
  { id: 'expcat-facilities', name: 'Instalaciones' },
  { id: 'expcat-transport', name: 'Transporte' },
  { id: 'expcat-nomina', name: 'Nómina' },
  { id: 'expcat-admin', name: 'Administrativo' },
  { id: 'expcat-uniformes', name: 'Uniformes' },
  { id: 'expcat-other', name: 'Otros' },
];

export const expenses: Expense[] = [
  {
    id: 'exp-001',
    categoryId: 'expcat-equipment',
    description: '10 pelotas de fútbol',
    amountUsd: 200,
    amountOriginal: 200,
    currency: 'USD',
    exchangeRate: 1,
    date: '2025-01-20',
    payee: 'Tienda Deportiva',
    recordedBy: 'user-admin',
    notes: '',
    createdAt: '2025-01-20T11:00:00Z',
  },
];

export const instructorPayments: InstructorPayment[] = [
  {
    id: 'instpay-001',
    instructorId: 'user-instructor-1',
    amountUsd: 300,
    amountOriginal: 300,
    currency: 'USD',
    exchangeRate: 1,
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    paymentDate: '2025-02-01',
    recordedBy: 'user-admin',
    notes: 'January salary',
    createdAt: '2025-02-01T10:00:00Z',
  },
];
