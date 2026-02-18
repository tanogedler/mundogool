import { Router, Request, Response } from 'express';
import { expenses, expenseCategories, instructorPayments, users } from '../data/sample';
import { Expense, InstructorPayment } from '../types';

const router = Router();

// GET all expense categories
router.get('/categories', (_req: Request, res: Response) => {
  res.json(expenseCategories);
});

// GET all expenses
router.get('/', (_req: Request, res: Response) => {
  const enrichedExpenses = expenses.map((e) => {
    const category = expenseCategories.find((c) => c.id === e.categoryId);
    return {
      ...e,
      categoryName: category?.name || 'Unknown',
    };
  });
  res.json(enrichedExpenses);
});

// POST create expense
router.post('/', (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    ...req.body,
    amountUsd,
    exchangeRate: exchangeRate || 1,
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// GET all instructor payments
router.get('/instructor-payments', (_req: Request, res: Response) => {
  const enrichedPayments = instructorPayments.map((p) => {
    const instructor = users.find((u) => u.id === p.instructorId);
    return {
      ...p,
      instructorName: instructor?.name || 'Unknown',
    };
  });
  res.json(enrichedPayments);
});

// POST create instructor payment
router.post('/instructor-payments', (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const newPayment: InstructorPayment = {
    id: `instpay-${Date.now()}`,
    ...req.body,
    amountUsd,
    exchangeRate: exchangeRate || 1,
    createdAt: new Date().toISOString(),
  };

  instructorPayments.push(newPayment);
  res.status(201).json(newPayment);
});

// GET expense summary
router.get('/summary/monthly', (_req: Request, res: Response) => {
  const summary: Record<string, { expenses: number; instructorPay: number; total: number }> = {};

  expenses.forEach((e) => {
    const month = e.date.substring(0, 7);
    if (!summary[month]) {
      summary[month] = { expenses: 0, instructorPay: 0, total: 0 };
    }
    summary[month].expenses += e.amountUsd;
    summary[month].total += e.amountUsd;
  });

  instructorPayments.forEach((p) => {
    const month = p.paymentDate.substring(0, 7);
    if (!summary[month]) {
      summary[month] = { expenses: 0, instructorPay: 0, total: 0 };
    }
    summary[month].instructorPay += p.amountUsd;
    summary[month].total += p.amountUsd;
  });

  res.json(summary);
});

export default router;
