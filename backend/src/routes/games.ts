import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { GameType } from '@prisma/client';

const router = Router();

// GET all games
router.get('/', async (_req: Request, res: Response) => {
  const games = await prisma.game.findMany({
    include: {
      league: { include: { category: true } },
      goals: { include: { student: true } },
    },
    orderBy: { date: 'desc' },
  });

  const result = games.map((g) => ({
    ...g,
    leagueName: g.league?.name || null,
    categoryName: g.league?.category.name || null,
    date: g.date.toISOString().split('T')[0],
    goals: g.goals.map((goal) => ({
      id: goal.id,
      studentId: goal.studentId,
      studentName: `${goal.student.firstName} ${goal.student.lastName}`,
      minute: goal.minute,
    })),
  }));

  res.json(result);
});

// GET game by ID with attendance
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const game = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: {
      league: { include: { category: true } },
      attendances: { include: { student: true } },
      goals: { include: { student: true } },
    },
  });

  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  res.json({
    ...game,
    leagueName: game.league?.name || null,
    categoryName: game.league?.category.name || null,
    date: game.date.toISOString().split('T')[0],
    attendances: game.attendances.map((a) => ({
      ...a,
      studentName: `${a.student.firstName} ${a.student.lastName}`,
      recordedAt: a.recordedAt.toISOString(),
    })),
    goals: game.goals.map((goal) => ({
      id: goal.id,
      studentId: goal.studentId,
      studentName: `${goal.student.firstName} ${goal.student.lastName}`,
      minute: goal.minute,
    })),
  });
});

// POST create game
router.post('/', async (req: Request, res: Response) => {
  const game = await prisma.game.create({
    data: {
      leagueId: req.body.leagueId || null,
      date: new Date(req.body.date),
      opponent: req.body.opponent,
      location: req.body.location,
      gameType: req.body.gameType as GameType,
      arbitrageFeeUsd: req.body.arbitrageFeeUsd,
      goalsFor: req.body.goalsFor,
      goalsAgainst: req.body.goalsAgainst,
    },
    include: {
      league: { include: { category: true } },
    },
  });

  res.status(201).json({
    ...game,
    leagueName: game.league?.name || null,
    categoryName: game.league?.category.name || null,
    date: game.date.toISOString().split('T')[0],
    goals: [],
  });
});

// PUT update game
router.put('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { goals, ...gameData } = req.body;

  // Update game
  await prisma.game.update({
    where: { id: req.params.id },
    data: {
      goalsFor: gameData.goalsFor,
      goalsAgainst: gameData.goalsAgainst,
    },
  });

  // Update goals - delete existing and create new
  if (goals) {
    await prisma.goal.deleteMany({ where: { gameId: req.params.id } });
    if (goals.length > 0) {
      await prisma.goal.createMany({
        data: goals.map((g: { studentId: string; minute: number }) => ({
          gameId: req.params.id,
          studentId: g.studentId,
          minute: g.minute,
        })),
      });
    }
  }

  // Fetch updated game with goals
  const updated = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: {
      league: { include: { category: true } },
      goals: { include: { student: true } },
    },
  });

  if (!updated) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  res.json({
    ...updated,
    leagueName: updated.league?.name || null,
    categoryName: updated.league?.category.name || null,
    date: updated.date.toISOString().split('T')[0],
    goals: updated.goals.map((goal) => ({
      id: goal.id,
      studentId: goal.studentId,
      studentName: `${goal.student.firstName} ${goal.student.lastName}`,
      minute: goal.minute,
    })),
  });
});

// GET eligible students for a game
router.get('/:id/eligible-students', async (req: Request<{ id: string }>, res: Response) => {
  const game = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: { attendances: true },
  });

  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const students = await prisma.student.findMany({
    where: { status: 'active' },
    include: { category: true },
  });

  const result = students.map((s) => {
    const attendance = game.attendances.find((a) => a.studentId === s.id);
    return {
      ...s,
      categoryName: s.category.name,
      birthdate: s.birthdate.toISOString().split('T')[0],
      attended: attendance?.attended || false,
      attendanceRecorded: !!attendance,
    };
  });

  res.json(result);
});

// POST record attendance
router.post('/:id/attendance', async (req: Request<{ id: string }>, res: Response) => {
  const { studentId, attended, recordedBy } = req.body;

  const attendance = await prisma.gameAttendance.upsert({
    where: {
      studentId_gameId: { studentId, gameId: req.params.id },
    },
    update: { attended, recordedBy },
    create: {
      gameId: req.params.id,
      studentId,
      attended,
      recordedBy,
    },
  });

  res.json(attendance);
});

// POST bulk attendance
router.post('/:id/attendance/bulk', async (req: Request<{ id: string }>, res: Response) => {
  const { attendances, recordedBy } = req.body as {
    attendances: Array<{ studentId: string; attended: boolean }>;
    recordedBy: string;
  };

  const results = await Promise.all(
    attendances.map((a) =>
      prisma.gameAttendance.upsert({
        where: {
          studentId_gameId: { studentId: a.studentId, gameId: req.params.id },
        },
        update: { attended: a.attended, recordedBy },
        create: {
          gameId: req.params.id,
          studentId: a.studentId,
          attended: a.attended,
          recordedBy,
        },
      })
    )
  );

  res.json({ updated: results.length, attendances: results });
});

export default router;