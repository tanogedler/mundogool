import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import studentsRouter from './routes/students';
import paymentsRouter from './routes/payments';
import expensesRouter from './routes/expenses';
import gamesRouter from './routes/games';
import organizationRouter from './routes/organization';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/students', studentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/games', gamesRouter);
app.use('/api', organizationRouter);

// Dashboard endpoint
app.get('/api/dashboard', async (_req, res) => {
  const [
    activeStudents,
    settings,
    payments,
    expenses,
    instructorPayments,
  ] = await Promise.all([
    prisma.student.count({ where: { status: 'active' } }),
    prisma.settings.findFirst(),
    prisma.payment.findMany(),
    prisma.expense.findMany(),
    prisma.instructorPayment.findMany(),
  ]);

  const currentMonth = new Date().toISOString().substring(0, 7);
  
  const monthlyIncome = payments
    .filter((p) => p.paymentDate.toISOString().startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amountUsd, 0);

  const monthlyExpenses = expenses
    .filter((e) => e.date.toISOString().startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amountUsd, 0);

  const monthlyInstructorPay = instructorPayments
    .filter((p) => p.paymentDate.toISOString().startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amountUsd, 0);

  const monthlyFee = settings?.monthlyFeeUsd || 50;
  const totalExpected = activeStudents * monthlyFee;
  const totalPaidMonthly = payments
    .filter(
      (p) =>
        p.paymentDate.toISOString().startsWith(currentMonth) &&
        p.paymentType === 'monthly_fee'
    )
    .reduce((sum, p) => sum + p.amountUsd, 0);

  res.json({
    activeStudents,
    monthlyIncome,
    monthlyExpenses: monthlyExpenses + monthlyInstructorPay,
    netIncome: monthlyIncome - monthlyExpenses - monthlyInstructorPay,
    outstandingBalance: totalExpected - totalPaidMonthly,
    settings: settings || {
      monthlyFeeUsd: 50,
      defaultCurrency: 'LOCAL',
      localCurrencyCode: 'VES',
    },
  });
});

// Settings endpoints
app.get('/api/settings', async (_req, res) => {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'default' },
    });
  }
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: req.body,
    create: { id: 'default', ...req.body },
  });
  res.json(settings);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏟️  Football Academy API running on http://localhost:${PORT}`);
});