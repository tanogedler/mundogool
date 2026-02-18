import { Router, Request, Response } from 'express';
import { students, categories, payments, leagueEnrollments, leagues, gameAttendances, games, settings } from '../data/sample';
import { Student, StudentBalance } from '../types';

const router = Router();

// GET all students
router.get('/', (_req: Request, res: Response) => {
  const enrichedStudents = students.map((s) => {
    const category = categories.find((c) => c.id === s.categoryId);
    return {
      ...s,
      categoryName: category?.name || 'Unknown',
    };
  });
  res.json(enrichedStudents);
});

// GET student by ID
router.get('/:id', (req: Request, res: Response) => {
  const student = students.find((s) => s.id === req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  const category = categories.find((c) => c.id === student.categoryId);
  res.json({ ...student, categoryName: category?.name || 'Unknown' });
});

// GET student balance
router.get('/:id/balance', (req: Request, res: Response) => {
  const student = students.find((s) => s.id === req.params.id);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  // Calculate expected fees
  const enrolledAt = new Date(student.enrolledAt);
  const now = new Date();
  const monthsEnrolled = Math.max(
    1,
    (now.getFullYear() - enrolledAt.getFullYear()) * 12 + (now.getMonth() - enrolledAt.getMonth()) + 1
  );
  const expectedMonthly = monthsEnrolled * settings.monthlyFeeUsd;

  // League fees
  const studentLeagueEnrollments = leagueEnrollments.filter((e) => e.studentId === student.id);
  const expectedLeagues = studentLeagueEnrollments.reduce((sum, enrollment) => {
    const league = leagues.find((l) => l.id === enrollment.leagueId);
    return sum + (league?.feeAmountUsd || 0);
  }, 0);

  // Game arbitrage fees
  const studentAttendances = gameAttendances.filter((a) => a.studentId === student.id && a.attended);
  const expectedGames = studentAttendances.reduce((sum, attendance) => {
    const game = games.find((g) => g.id === attendance.gameId);
    return sum + (game?.arbitrageFeeUsd || 0);
  }, 0);

  // Total paid
  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amountUsd, 0);

  const totalExpected = expectedMonthly + expectedLeagues + expectedGames;

  const balance: StudentBalance = {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    expectedMonthly,
    expectedLeagues,
    expectedGames,
    totalExpected,
    totalPaid,
    balance: totalPaid - totalExpected, // negative = owes money
  };

  res.json(balance);
});

// POST create student
router.post('/', (req: Request, res: Response) => {
  const newStudent: Student = {
    id: `stu-${Date.now()}`,
    ...req.body,
    enrolledAt: req.body.enrolledAt || new Date().toISOString().split('T')[0],
    status: 'active',
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT update student
router.put('/:id', (req: Request, res: Response) => {
  const index = students.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// DELETE student (soft delete - set to inactive)
router.delete('/:id', (req: Request, res: Response) => {
  const index = students.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  students[index].status = 'inactive';
  res.json({ message: 'Student deactivated', student: students[index] });
});

export default router;
