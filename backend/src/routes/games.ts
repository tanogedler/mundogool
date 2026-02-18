import { Router, Request, Response } from 'express';
import { games, gameAttendances, leagues, students, categories } from '../data/sample';
import { Game, GameAttendance } from '../types';

const router = Router();

// GET all games
router.get('/', (_req: Request, res: Response) => {
  const enrichedGames = games.map((g) => {
    const league = leagues.find((l) => l.id === g.leagueId);
    const category = league ? categories.find((c) => c.id === league.categoryId) : null;
    return {
      ...g,
      leagueName: league?.name || 'Unknown',
      categoryName: category?.name || 'Unknown',
    };
  });
  res.json(enrichedGames);
});

// GET game by ID with attendance
router.get('/:id', (req: Request, res: Response) => {
  const game = games.find((g) => g.id === req.params.id);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const attendances = gameAttendances
    .filter((a) => a.gameId === game.id)
    .map((a) => {
      const student = students.find((s) => s.id === a.studentId);
      return {
        ...a,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      };
    });

  const league = leagues.find((l) => l.id === game.leagueId);

  res.json({
    ...game,
    leagueName: league?.name || 'Unknown',
    attendances,
  });
});

// POST create game
router.post('/', (req: Request, res: Response) => {
  const newGame: Game = {
    id: `game-${Date.now()}`,
    ...req.body,
  };
  games.push(newGame);
  res.status(201).json(newGame);
});

// PUT update game
router.put('/:id', (req: Request, res: Response) => {
  const index = games.findIndex((g) => g.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  games[index] = { ...games[index], ...req.body };
  res.json(games[index]);
});

// GET eligible students for a game (based on league category)
router.get('/:id/eligible-students', (req: Request, res: Response) => {
  const game = games.find((g) => g.id === req.params.id);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const league = leagues.find((l) => l.id === game.leagueId);
  if (!league) {
    res.status(404).json({ error: 'League not found' });
    return;
  }

  // Get students in the league's category (or adjacent for flexibility)
  const eligibleStudents = students
    .filter((s) => s.status === 'active')
    .map((s) => {
      const category = categories.find((c) => c.id === s.categoryId);
      const attendance = gameAttendances.find((a) => a.gameId === game.id && a.studentId === s.id);
      return {
        ...s,
        categoryName: category?.name || 'Unknown',
        attended: attendance?.attended || false,
        attendanceRecorded: !!attendance,
      };
    });

  res.json(eligibleStudents);
});

// POST/PUT record attendance for a game
router.post('/:id/attendance', (req: Request, res: Response) => {
  const game = games.find((g) => g.id === req.params.id);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const { studentId, attended, recordedBy } = req.body;

  // Check if attendance already exists
  const existingIndex = gameAttendances.findIndex(
    (a) => a.gameId === game.id && a.studentId === studentId
  );

  if (existingIndex >= 0) {
    // Update existing
    gameAttendances[existingIndex] = {
      ...gameAttendances[existingIndex],
      attended,
      recordedBy,
      recordedAt: new Date().toISOString(),
    };
    res.json(gameAttendances[existingIndex]);
  } else {
    // Create new
    const newAttendance: GameAttendance = {
      id: `att-${Date.now()}`,
      gameId: game.id,
      studentId,
      attended,
      recordedBy,
      recordedAt: new Date().toISOString(),
    };
    gameAttendances.push(newAttendance);
    res.status(201).json(newAttendance);
  }
});

// POST bulk attendance (for mobile-friendly batch updates)
router.post('/:id/attendance/bulk', (req: Request, res: Response) => {
  const game = games.find((g) => g.id === req.params.id);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const { attendances, recordedBy } = req.body as {
    attendances: Array<{ studentId: string; attended: boolean }>;
    recordedBy: string;
  };

  const results: GameAttendance[] = [];

  attendances.forEach(({ studentId, attended }) => {
    const existingIndex = gameAttendances.findIndex(
      (a) => a.gameId === game.id && a.studentId === studentId
    );

    if (existingIndex >= 0) {
      gameAttendances[existingIndex] = {
        ...gameAttendances[existingIndex],
        attended,
        recordedBy,
        recordedAt: new Date().toISOString(),
      };
      results.push(gameAttendances[existingIndex]);
    } else {
      const newAttendance: GameAttendance = {
        id: `att-${Date.now()}-${studentId}`,
        gameId: game.id,
        studentId,
        attended,
        recordedBy,
        recordedAt: new Date().toISOString(),
      };
      gameAttendances.push(newAttendance);
      results.push(newAttendance);
    }
  });

  res.json({ updated: results.length, attendances: results });
});

export default router;
