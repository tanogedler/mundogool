import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET all students
router.get('/', async (_req: Request, res: Response) => {
  const students = await prisma.student.findMany({
    include: { category: true },
    orderBy: { firstName: 'asc' },
  });
  const result = students.map((s) => ({
    ...s,
    categoryName: s.category.name,
    birthdate: s.birthdate.toISOString().split('T')[0],
    enrolledAt: s.enrolledAt.toISOString().split('T')[0],
  }));
  res.json(result);
});

// GET student by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  res.json({
    ...student,
    categoryName: student.category.name,
    birthdate: student.birthdate.toISOString().split('T')[0],
    enrolledAt: student.enrolledAt.toISOString().split('T')[0],
  });
});

// GET student balance
router.get('/:id/balance', async (req: Request<{ id: string }>, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      leagueEnrollments: { include: { league: true } },
      gameAttendances: { where: { attended: true }, include: { game: true } },
      payments: true,
    },
  });

  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const settings = await prisma.settings.findFirst();
  const monthlyFee = settings?.monthlyFeeUsd || 50;

  const enrolledAt = new Date(student.enrolledAt);
  const now = new Date();
  const monthsEnrolled = Math.max(
    1,
    (now.getFullYear() - enrolledAt.getFullYear()) * 12 +
      (now.getMonth() - enrolledAt.getMonth()) + 1
  );

  const expectedMonthly = monthsEnrolled * monthlyFee;
  const expectedLeagues = student.leagueEnrollments.reduce(
    (sum, e) => sum + e.league.feeAmountUsd,
    0
  );
  const expectedGames = student.gameAttendances.reduce(
    (sum, a) => sum + a.game.arbitrageFeeUsd,
    0
  );
  const totalPaid = student.payments.reduce((sum, p) => sum + p.amountUsd, 0);
  const totalExpected = expectedMonthly + expectedLeagues + expectedGames;

  res.json({
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    expectedMonthly,
    expectedLeagues,
    expectedGames,
    totalExpected,
    totalPaid,
    balance: totalPaid - totalExpected,
  });
});

// POST create student
router.post('/', async (req: Request, res: Response) => {
  const student = await prisma.student.create({
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthdate: new Date(req.body.birthdate),
      guardianName: req.body.guardianName,
      guardianPhone: req.body.guardianPhone,
      guardianEmail: req.body.guardianEmail,
      categoryId: req.body.categoryId,
    },
    include: { category: true },
  });
  res.status(201).json({
    ...student,
    categoryName: student.category.name,
    birthdate: student.birthdate.toISOString().split('T')[0],
    enrolledAt: student.enrolledAt.toISOString().split('T')[0],
  });
});

// PUT update student
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      birthdate: req.body.birthdate ? new Date(req.body.birthdate) : undefined,
    },
    include: { category: true },
  });
  res.json({
    ...student,
    categoryName: student.category.name,
    birthdate: student.birthdate.toISOString().split('T')[0],
    enrolledAt: student.enrolledAt.toISOString().split('T')[0],
  });
});

// DELETE student (soft delete)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: { status: 'inactive' },
  });
  res.json({ message: 'Student deactivated', student });
});

export default router;