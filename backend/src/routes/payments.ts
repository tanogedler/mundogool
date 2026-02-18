import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Currency, PaymentMethod, PaymentType } from '@prisma/client';

const router = Router();

// GET all payments
router.get('/', async (_req: Request, res: Response) => {
  const payments = await prisma.payment.findMany({
    include: { student: true },
    orderBy: { paymentDate: 'desc' },
  });
  const result = payments.map((p) => ({
    ...p,
    studentName: `${p.student.firstName} ${p.student.lastName}`,
    paymentDate: p.paymentDate.toISOString().split('T')[0],
  }));
  res.json(result);
});

// GET payments by student
router.get('/student/:studentId', async (req: Request<{ studentId: string }>, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { studentId: req.params.studentId },
    orderBy: { paymentDate: 'desc' },
  });
  res.json(payments.map((p) => ({
    ...p,
    paymentDate: p.paymentDate.toISOString().split('T')[0],
  })));
});

// GET payment by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { student: true },
  });
  if (!payment) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }
  res.json({
    ...payment,
    studentName: `${payment.student.firstName} ${payment.student.lastName}`,
    paymentDate: payment.paymentDate.toISOString().split('T')[0],
  });
});

// POST create payment
router.post('/', async (req: Request, res: Response) => {
  const { amountOriginal, currency, exchangeRate } = req.body;
  const amountUsd = currency === 'USD' ? amountOriginal : amountOriginal / exchangeRate;

  const payment = await prisma.payment.create({
    data: {
      studentId: req.body.studentId,
      amountUsd,
      amountOriginal,
      currency: currency as Currency,
      exchangeRate: exchangeRate || 1,
      rateSource: req.body.rateSource || 'manual',
      paymentDate: new Date(req.body.paymentDate),
      paymentMethod: req.body.paymentMethod as PaymentMethod,
      paymentType: req.body.paymentType as PaymentType,
      referenceId: req.body.referenceId,
      referenceNumber: req.body.referenceNumber,
      recordedBy: req.body.recordedBy,
      notes: req.body.notes,
    },
    include: { student: true },
  });

  res.status(201).json({
    ...payment,
    studentName: `${payment.student.firstName} ${payment.student.lastName}`,
    paymentDate: payment.paymentDate.toISOString().split('T')[0],
  });
});

// GET payment summary
router.get('/summary/monthly', async (_req: Request, res: Response) => {
  const payments = await prisma.payment.findMany();
  const summary: Record<string, { total: number; byType: Record<string, number> }> = {};

  payments.forEach((p) => {
    const month = p.paymentDate.toISOString().substring(0, 7);
    if (!summary[month]) {
      summary[month] = { total: 0, byType: {} };
    }
    summary[month].total += p.amountUsd;
    summary[month].byType[p.paymentType] =
      (summary[month].byType[p.paymentType] || 0) + p.amountUsd;
  });

  res.json(summary);
});

export default router;