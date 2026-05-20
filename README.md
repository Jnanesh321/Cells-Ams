# VCET Academic Monitoring System (Cells-AMS)

A full-stack academic monitoring system for **Vidya Vikas Institute of Engineering & Technology (VCET)**.  
Monitors student attendance, internal assessment (IA) marks, CIE eligibility, detention status, counselling, and more.

## Architecture

```
Cells-AMS/
├── src/                    # Express.js backend (TypeScript)
│   ├── controllers/        # Request handlers with Zod validation
│   ├── services/           # Business logic & Prisma queries
│   ├── routes/             # 21 route files mapped to endpoints
│   ├── middleware/         # Auth, role guard, ownership checks
│   ├── config/             # Prisma client, env config
│   └── utils/              # API response helpers, notifications
├── prisma/
│   ├── schema.prisma       # PostgreSQL schema (18 models)
│   └── seed.ts             # Comprehensive test data seeder
├── VCET-AMS-Mobile/        # React Native (Expo) mobile app
│   └── src/
│       ├── screens/        # Role-based screens (8 roles)
│       ├── store/          # Zustand state management
│       ├── navigation/     # Stack + Tab navigators per role
│       ├── components/     # Reusable UI components
│       ├── mock/           # Offline mock data fallbacks
│       └── hooks/          # Custom React hooks
└── todo.md                 # Current sprint tasks
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Mobile | React Native, Expo SDK 54, TypeScript |
| State | Zustand with AsyncStorage persistence |
| Validation | Zod (shared patterns) |

## Roles

| Role | Description |
|------|-------------|
| STUDENT | View attendance, IA marks, CIE, detention status, profile |
| PARENT | Monitor ward's academic progress |
| FACULTY | Mark attendance, enter IA marks, upload notes |
| HOD | Department oversight, CIE management, detention, counselling assignments |
| PRINCIPAL | College-wide analytics |
| ADMIN | User creation, subject management, system settings |
| ADMISSION_CELL | Student admission and batch management |
| EXAM_CELL | Question paper builder, absentee management |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env   # Edit DATABASE_URL, JWT secrets

# Push schema and seed
npx prisma db push
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
```

### Mobile App Setup

```bash
cd VCET-AMS-Mobile
npm install
npx expo start
```

### Test Credentials

| Role | USN | Password |
|------|-----|----------|
| CSE Student | `4VP24CS001` | `vcet@123` |
| ECE Student | `4VP24EC001` | `vcet@123` |
| Faculty | `FAC_CSE_001` | `faculty@123` |
| HOD CSE | `HOD_CSE` | `hod@123` |
| HOD ECE | `HOD_ECE` | `hod@123` |
| Admin | `ADMIN001` | `admin@123` |
| Principal | `PRINCIPAL` | `principal@123` |
| Parent | `PARENT_4VP24CS001` | `parent@123` |

## API Endpoints (21 route groups)

`/auth`, `/admin`, `/attendance`, `/analytics`, `/marks`, `/reports`, `/notices`,  
`/calendar`, `/academic-day`, `/timetable`, `/birthdays`, `/faculty`, `/hod`,  
`/counselling`, `/admission`, `/email`, `/ia`, `/detention`, `/notifications`,  
`/student`, `/subjects`

## Key Features

- **IA Marks System** — Sub-question level entry, section A/B best-of computation
- **CIE Management** — Auto-compute eligibility from IA + assignments, finalize lock
- **Detention Engine** — Checks attendance (<75%) + CIE (<20/50) per subject
- **Question Paper Builder** — Configurable IA question papers with sub-questions
- **Notification System** — Auto-generated per-event, marks read, bell UI component
- **Counselling Tracker** — Faculty-to-student assignments, session logging
- **Offline-First Mobile** — Zustand persist, mock data fallbacks when backend unavailable
