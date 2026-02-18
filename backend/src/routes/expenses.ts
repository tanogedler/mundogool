import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Currency } from '@prisma/client';

const router = Router();

// GET all expense categories
router.get('/categories', async (_req: Request, res: Response) => {
  const categories = await prisma.expenseCategory.findMany();
  res.json(categories);
});

// GET all expenses
router.get('/', async (_req: Request, res: Response) => {
  const expenses = await prisma.expense.findMany({
    include: { category: true },
    orderBy: { date: 'desc' },
  });
  const result = expenses.map((e) => ({
    ...e,
    categoryName: e.category.name,
    date: e.date.toISOString().split('T')[0],
  }));
  res.json(result);
});

// POST create expense
router.post('/', async (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const expense = await prisma.expense.create({
    data: {
      categoryId: req.body.categoryId,
      description: req.body.description,
      amountUsd,
      amountOriginal,
      currency: currency as Currency,
      exchangeRate: exchangeRate || 1,
      date: new Date(req.body.date),
      payee: req.body.payee,
      recordedBy: req.body.recordedBy,
      notes: req.body.notes,
    },
    include: { category: true },
  });

  res.status(201).json({
    ...expense,
    categoryName: expense.category.name,
    date: expense.date.toISOString().split('T')[0],
  });
});

// GET instructor payments
router.get('/instructor-payments', async (_req: Request, res: Response) => {
  const payments = await prisma.instructorPayment.findMany({
    include: { instructor: true },
    orderBy: { paymentDate: 'desc' },
  });
  const result = payments.map((p) => ({
    ...p,
    instructorName: p.instructor.name,
    periodStart: p.periodStart.toISOString().split('T')[0],
    periodEnd: p.periodEnd.toISOString().split('T')[0],
    paymentDate: p.paymentDate.toISOString().split('T')[0],
  }));
  res.json(result);
});

// POST create instructor payment
router.post('/instructor-payments', async (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const payment = await prisma.instructorPayment.create({
    data: {
      instructorId: req.body.instructorId,
      amountUsd,
      amountOriginal,
      currency: currency as Currency,
      exchangeRate: exchangeRate || 1,
      periodStart: new Date(req.body.periodStart),
      periodEnd: new Date(req.body.periodEnd),
      paymentDate: new Date(req.body.paymentDate),
      recordedBy: req.body.recordedBy,
      notes: req.body.notes,
    },
    include: { instructor: true },
  });

  res.status(201).json({
    ...payment,
    instructorName: payment.instructor.name,
    periodStart: payment.periodStart.toISOString().split('T')[0],
    periodEnd: payment.periodEnd.toISOString().split('T')[0],
    paymentDate: payment.paymentDate.toISOString().split('T')[0],
  });
});

// GET expense summary
router.get('/summary/monthly', async (_req: Request, res: Response) => {
  const expenses = await prisma.expense.findMany();
  const instructorPayments = await prisma.instructorPayment.findMany();

  const summary: Record<string, { expenses: number; instructorPay: number; total: number }> = {};

  expenses.forEach((e) => {
    const month = e.date.toISOString().substring(0, 7);
    if (!summary[month]) {
      summary[month] = { expenses: 0, instructorPay: 0, total: 0 };
    }
    summary[month].expenses += e.amountUsd;
    summary[month].total += e.amountUsd;
  });

  instructorPayments.forEach((p) => {
    const month = p.paymentDate.toISOString().substring(0, 7);
    if (!summary[month]) {
      summary[month] = { expenses: 0, instructorPay: 0, total: 0 };
    }
    summary[month].instructorPay += p.amountUsd;
    summary[month].total += p.amountUsd;
  });

  res.json(summary);
});

export default router;