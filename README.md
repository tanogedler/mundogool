# Football Academy Accounting System

A web application to manage student payments, expenses, and game attendance for a football academy.

## Features

- **Students Management**: Register students with guardian info, assign to age categories
- **Payment Tracking**: Record payments in USD or local currency with exchange rate conversion
- **Expense Management**: Track academy expenses and instructor payments
- **League & Game Management**: Organize leagues, games, and track attendance
- **Dashboard**: Overview of income, expenses, and outstanding balances

## Project Structure

```
football-academy/
├── frontend/          # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── api/       # API client
│   │   ├── components/# Shared components
│   │   ├── pages/     # Page components
│   │   └── types/     # TypeScript types
│   └── ...
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── types/     # TypeScript types
│   │   └── data/      # Sample data (replace with DB)
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard summary
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `GET /api/students/:id/balance` - Get student balance
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Deactivate student

### Payments
- `GET /api/payments` - List all payments
- `GET /api/payments/student/:studentId` - Get student payments
- `POST /api/payments` - Record payment
- `GET /api/payments/summary/monthly` - Monthly payment summary

### Expenses
- `GET /api/expenses` - List all expenses
- `GET /api/expenses/categories` - List expense categories
- `POST /api/expenses` - Create expense
- `GET /api/expenses/instructor-payments` - List instructor payments
- `POST /api/expenses/instructor-payments` - Create instructor payment

### Organization
- `GET /api/categories` - List age categories
- `GET /api/leagues` - List leagues
- `POST /api/leagues` - Create league
- `POST /api/leagues/:id/enroll` - Enroll student in league

### Games
- `GET /api/games` - List all games
- `GET /api/games/:id` - Get game with attendance
- `POST /api/games` - Create game
- `POST /api/games/:id/attendance` - Record attendance
- `POST /api/games/:id/attendance/bulk` - Bulk record attendance

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, TypeScript
- **Database**: In-memory (replace with PostgreSQL/SQLite for production)

## Next Steps

1. Add authentication (JWT)
2. Connect to a real database (PostgreSQL recommended)
3. Add exchange rate API integration
4. Implement role-based access control
5. Add reporting/export features
6. Mobile-optimized attendance recording

## License

MIT
# mundogool
