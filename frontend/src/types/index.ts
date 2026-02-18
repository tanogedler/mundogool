// Shared types - keep in sync with backend

export type UserRole = 'admin' | 'secretary' | 'instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  studentCount?: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  categoryId: string;
  categoryName?: string;
  enrolledAt: string;
  status: 'active' | 'inactive';
}

export interface League {
  id: string;
  name: string;
  year: number;
  categoryId: string;
  categoryName?: string;
  feeAmountUsd: number;
  enrollmentCount?: number;
}

export interface Goal {
  id: string;
  studentId: string;
  studentName?: string;
  minute: number;
}

export interface Game {
  id: string;
  leagueId: string;
  leagueName?: string;
  categoryName?: string;
  date: string;
  opponent: string;
  location: string;
  gameType: 'amistoso' | 'liga'| 'copa';
  arbitrageFeeUsd: number;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goals: Goal[];
}

export interface GameAttendance {
  id: string;
  studentId: string;
  studentName?: string;
  gameId: string;
  attended: boolean;
  recordedBy: string;
  recordedAt: string;
}

export type Currency = 'USD' | 'LOCAL';
export type PaymentMethod = 'cash_usd' | 'cash_local' | 'transfer_local';
export type PaymentType = 'monthly_fee' | 'league_fee' | 'game_arbitrage';

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  amountUsd: number;
  amountOriginal: number;
  currency: Currency;
  exchangeRate: number;
  rateSource: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  referenceId: string | null;
  referenceNumber: string;  
  recordedBy: string;
  notes: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  amountUsd: number;
  amountOriginal: number;
  currency: Currency;
  exchangeRate: number;
  date: string;
  payee: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
}

export interface InstructorPayment {
  id: string;
  instructorId: string;
  instructorName?: string;
  amountUsd: number;
  amountOriginal: number;
  currency: Currency;
  exchangeRate: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
}

export interface Settings {
  monthlyFeeUsd: number;
  defaultCurrency: Currency;
  localCurrencyCode: string;
}

export interface StudentBalance {
  studentId: string;
  studentName: string;
  expectedMonthly: number;
  expectedLeagues: number;
  expectedGames: number;
  totalExpected: number;
  totalPaid: number;
  balance: number;
}

export interface DashboardData {
  activeStudents: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  outstandingBalance: number;
  settings: Settings;
}
