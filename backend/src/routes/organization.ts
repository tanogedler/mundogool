import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ============ CATEGORIES ============

// GET all categories
router.get('/categories', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { students: { where: { status: 'active' } } } },
    },
  });

  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    minAge: c.minAge,
    maxAge: c.maxAge,
    studentCount: c._count.students,
  }));

  res.json(result);
});

// GET category by ID
router.get('/categories/:id', async (req: Request<{ id: string }>, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: {
      students: {
        where: { status: 'active' },
        select: { id: true, firstName: true, lastName: true, birthdate: true },
      },
    },
  });

  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  res.json({
    ...category,
    students: category.students.map((s) => ({
      ...s,
      birthdate: s.birthdate.toISOString().split('T')[0],
    })),
  });
});

// ============ LEAGUES ============

// GET all leagues
router.get('/leagues', async (_req: Request, res: Response) => {
  const leagues = await prisma.league.findMany({
    include: {
      category: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { year: 'desc' },
  });

  const result = leagues.map((l) => ({
    id: l.id,
    name: l.name,
    year: l.year,
    categoryId: l.categoryId,
    categoryName: l.category.name,
    feeAmountUsd: l.feeAmountUsd,
    enrollmentCount: l._count.enrollments,
  }));

  res.json(result);
});

// GET league by ID
router.get('/leagues/:id', async (req: Request<{ id: string }>, res: Response) => {
  const league = await prisma.league.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      enrollments: {
        include: { student: true },
      },
    },
  });

  if (!league) {
    res.status(404).json({ error: 'League not found' });
    return;
  }

  res.json({
    id: league.id,
    name: league.name,
    year: league.year,
    categoryId: league.categoryId,
    categoryName: league.category.name,
    feeAmountUsd: league.feeAmountUsd,
    enrollments: league.enrollments.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      studentName: `${e.student.firstName} ${e.student.lastName}`,
      enrolledAt: e.enrolledAt.toISOString().split('T')[0],
    })),
  });
});

// POST create league
router.post('/leagues', async (req: Request, res: Response) => {
  const league = await prisma.league.create({
    data: {
      name: req.body.name,
      year: req.body.year,
      categoryId: req.body.categoryId,
      feeAmountUsd: req.body.feeAmountUsd,
    },
    include: { category: true },
  });

  res.status(201).json({
    ...league,
    categoryName: league.category.name,
    enrollmentCount: 0,
  });
});

// POST enroll student in league
router.post('/leagues/:id/enroll', async (req: Request<{ id: string }>, res: Response) => {
  const { studentId } = req.body;

  try {
    const enrollment = await prisma.leagueEnrollment.create({
      data: {
        studentId,
        leagueId: req.params.id,
      },
    });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ error: 'Student already enrolled in this league' });
  }
});

// DELETE unenroll student from league
router.delete(
  '/leagues/:leagueId/enroll/:studentId',
  async (req: Request<{ leagueId: string; studentId: string }>, res: Response) => {
    try {
      await prisma.leagueEnrollment.delete({
        where: {
          studentId_leagueId: {
            studentId: req.params.studentId,
            leagueId: req.params.leagueId,
          },
        },
      });
      res.json({ message: 'Student unenrolled from league' });
    } catch (error) {
      res.status(404).json({ error: 'Enrollment not found' });
    }
  }
);

export default router;