import { Router, Request, Response } from 'express';
import { categories, leagues, leagueEnrollments, students } from '../data/sample';
import { League, LeagueEnrollment } from '../types';

const router = Router(); 

// ============ CATEGORIES ============

// GET all categories
router.get('/categories', (_req: Request, res: Response) => {
  const enrichedCategories = categories.map((c) => {
    const studentCount = students.filter((s) => s.categoryId === c.id && s.status === 'active').length;
    return { ...c, studentCount };
  });
  res.json(enrichedCategories);
});

// GET category by ID with students
router.get('/categories/:id', (req: Request, res: Response) => {
  const category = categories.find((c) => c.id === req.params.id);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const categoryStudents = students
    .filter((s) => s.categoryId === category.id && s.status === 'active')
    .map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      birthdate: s.birthdate,
    }));

  res.json({ ...category, students: categoryStudents });
});

// ============ LEAGUES ============

// GET all leagues
router.get('/leagues', (_req: Request, res: Response) => {
  const enrichedLeagues = leagues.map((l) => {
    const category = categories.find((c) => c.id === l.categoryId);
    const enrollmentCount = leagueEnrollments.filter((e) => e.leagueId === l.id).length;
    return {
      ...l,
      categoryName: category?.name || 'Unknown',
      enrollmentCount,
    };
  });
  res.json(enrichedLeagues);
});

// GET league by ID with enrollments
router.get('/leagues/:id', (req: Request, res: Response) => {
  const league = leagues.find((l) => l.id === req.params.id);
  if (!league) {
    res.status(404).json({ error: 'League not found' });
    return;
  }

  const enrollments = leagueEnrollments
    .filter((e) => e.leagueId === league.id)
    .map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      return {
        ...e,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      };
    });

  const category = categories.find((c) => c.id === league.categoryId);

  res.json({
    ...league,
    categoryName: category?.name || 'Unknown',
    enrollments,
  });
});

// POST create league
router.post('/leagues', (req: Request, res: Response) => {
  const newLeague: League = {
    id: `league-${Date.now()}`,
    ...req.body,
  };
  leagues.push(newLeague);
  res.status(201).json(newLeague);
});

// POST enroll student in league
router.post('/leagues/:id/enroll', (req: Request, res: Response) => {
  const league = leagues.find((l) => l.id === req.params.id);
  if (!league) {
    res.status(404).json({ error: 'League not found' });
    return;
  }

  const { studentId } = req.body;

  // Check if already enrolled
  const existing = leagueEnrollments.find(
    (e) => e.leagueId === league.id && e.studentId === studentId
  );
  if (existing) {
    res.status(400).json({ error: 'Student already enrolled in this league' });
    return;
  }

  const newEnrollment: LeagueEnrollment = {
    id: `enroll-${Date.now()}`,
    studentId,
    leagueId: league.id,
    enrolledAt: new Date().toISOString().split('T')[0],
  };

  leagueEnrollments.push(newEnrollment);
  res.status(201).json(newEnrollment);
});

// DELETE unenroll student from league
router.delete('/leagues/:leagueId/enroll/:studentId', (req: Request, res: Response) => {
  const index = leagueEnrollments.findIndex(
    (e) => e.leagueId === req.params.leagueId && e.studentId === req.params.studentId
  );

  if (index === -1) {
    res.status(404).json({ error: 'Enrollment not found' });
    return;
  }

  leagueEnrollments.splice(index, 1);
  res.json({ message: 'Student unenrolled from league' });
});

export default router;
