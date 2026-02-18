import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import studentsRouter from './routes/students';
import paymentsRouter from './routes/payments';
import expensesRouter from './routes/expenses';
import gamesRouter from './routes/games';
import organizationRouter from './routes/organization';
import { settings, students, payments, expenses, instructorPayments } from './data/sample';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/games', gamesRouter);
app.use('/api', organizationRouter); // /api/categories, /api/leagues

// Dashboard summary endpoint
app.get('/api/dashboard', (_req, res) => {
  const activeStudents = students.filter((s) => s.status === 'active').length;

  // Current month income
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyIncome = payments
    .filter((p) => p.paymentDate.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amountUsd, 0);

  // Current month expenses
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amountUsd, 0);

  const monthlyInstructorPay = instructorPayments
    .filter((p) => p.paymentDate.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amountUsd, 0);

  // Outstanding balances (simplified)
  const totalExpected = activeStudents * settings.monthlyFeeUsd; // Just monthly for simplicity
  const totalPaid = payments
    .filter((p) => p.paymentDate.startsWith(currentMonth) && p.paymentType === 'monthly_fee')
    .reduce((sum, p) => sum + p.amountUsd, 0);

  res.json({
    activeStudents,
    monthlyIncome,
    monthlyExpenses: monthlyExpenses + monthlyInstructorPay,
    netIncome: monthlyIncome - monthlyExpenses - monthlyInstructorPay,
    outstandingBalance: totalExpected - totalPaid,
    settings,
  });
});

// Settings endpoint
app.get('/api/settings', (_req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  Object.assign(settings, req.body);
  res.json(settings);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏟️  Football Academy API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard`);
});
