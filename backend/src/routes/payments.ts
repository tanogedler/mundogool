import { Router, Request, Response } from 'express';
import { payments, students } from '../data/sample';
import { Payment } from '../types';

const router = Router();

// GET all payments
router.get('/', (_req: Request, res: Response) => {
  const enrichedPayments = payments.map((p) => {
    const student = students.find((s) => s.id === p.studentId);
    return {
      ...p,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
    };
  });
  res.json(enrichedPayments);
});

// GET payments by student
router.get('/student/:studentId', (req: Request, res: Response) => {
  const studentPayments = payments.filter((p) => p.studentId === req.params.studentId);
  res.json(studentPayments);
});

// GET payment by ID
router.get('/:id', (req: Request, res: Response) => {
  const payment = payments.find((p) => p.id === req.params.id);
  if (!payment) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }
  res.json(payment);
});

// POST create payment
router.post('/', (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;

  // Calculate USD amount
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    ...req.body,
    amountUsd,
    exchangeRate: exchangeRate || 1,
    createdAt: new Date().toISOString(),
  };

  payments.push(newPayment);
  res.status(201).json(newPayment);
});

// GET payment summary (income by period)
router.get('/summary/monthly', (_req: Request, res: Response) => {
  const summary: Record<string, { total: number; byType: Record<string, number> }> = {};

  payments.forEach((p) => {
    const month = p.paymentDate.substring(0, 7); // YYYY-MM
    if (!summary[month]) {
      summary[month] = { total: 0, byType: {} };
    }
    summary[month].total += p.amountUsd;
    summary[month].byType[p.paymentType] = (summary[month].byType[p.paymentType] || 0) + p.amountUsd;
  });

  res.json(summary);
});

export default router;
