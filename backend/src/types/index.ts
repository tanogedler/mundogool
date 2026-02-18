// Domain types for Football Academy Accounting System

export type UserRole = 'admin' | 'secretary' | 'instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string; // e.g., "Sub-10", "Sub-12"
  minAge: number;
  maxAge: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string; // ISO date
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  categoryId: string;
  enrolledAt: string;
  status: 'active' | 'inactive';
}

export interface League {
  id: string;
  name: string;
  year: number;
  categoryId: string;
  feeAmountUsd: number;
}

export interface LeagueEnrollment {
  id: string;
  studentId: string;
  leagueId: string;
  enrolledAt: string;
}

export type GameType = 'amistoso' | 'liga'| 'copa';

export interface Goal {
  id: string;
  studentId: string;
  studentName?: string;
  minute: number;
}

export interface Game {
  id: string;
  leagueId: string;
  date: string;
  opponent: string;
  location: string;
  gameType: GameType;
  arbitrageFeeUsd: number;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goals: Goal[];
}

export interface GameAttendance {
  id: string;
  studentId: string;
  gameId: string;
  attended: boolean;
  recordedBy: string; // User ID
  recordedAt: string;
}

export type Currency = 'USD' | 'LOCAL';

export type PaymentMethod = 'cash_usd' | 'cash_local' | 'transfer_local' | 'transfer_usd';

export type PaymentType = 'monthly_fee' | 'league_fee' | 'game_arbitrage';

export interface Payment {
  id: string;
  studentId: string;
  amountUsd: number;
  amountOriginal: number;
  currency: Currency;
  exchangeRate: number; // LOCAL per USD, 1.0 if USD
  rateSource: string; // "manual", "api", etc.
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  referenceId: string | null; // league_id or game_id if applicable
  referenceNumber: string;  // 
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
  instructorId: string; // User ID where role = instructor
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
  localCurrencyCode: string; // e.g., "VES", "ARS", etc.
}

// API response types
export interface StudentBalance {
  studentId: string;
  studentName: string;
  expectedMonthly: number;
  expectedLeagues: number;
  expectedGames: number;
  totalExpected: number;
  totalPaid: number;
  balance: number; // negative = owes money
}
