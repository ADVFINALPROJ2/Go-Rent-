# GoRent Deployment Guide

## Prerequisites

- Node.js 20+
- npm
- Optional: Docker and Docker Compose
- Optional: Vercel account

## Environment Variables

Create a `.env.local` file in the project root:

```env
AUTH_SECRET=replace-with-a-long-random-secret
SQLITE_DB_PATH=./data/gorent.sqlite
```

`AUTH_SECRET` signs the HTTP-only session cookie. Use a strong unique value outside local development.

## Local Development

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000.

Seeded login accounts:

- `admin@gorent.test` / `Password123!`
- `owner@gorent.test` / `Password123!`
- `renter@gorent.test` / `Password123!`

## Database Setup

The app uses Drizzle ORM with SQLite.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

The default database path is `data/gorent.sqlite`. The `data/` directory is ignored by Git and should not be committed.

## Build

```bash
npm run lint
npm run build
```

## Production Deployment

SQLite is best for local demos unless the deployment target provides persistent disk.

For production, choose one of these options:

- Deploy with a persistent disk or Docker volume mounted to the `data/` directory.
- Set `SQLITE_DB_PATH` to a mounted persistent path.
- Migrate the Drizzle schema to a managed production database if deploying to a stateless platform.

### Vercel

Vercel serverless deployments do not provide durable local disk for SQLite writes. Use Vercel only for UI/demo builds with an external persistent database, or choose a host with persistent storage.

### Docker

If Docker is added, mount a volume for `/app/data` so `gorent.sqlite` survives container restarts:

```bash
docker run -p 3000:3000 --env-file .env.local -v gorent-data:/app/data gorent
```

## Troubleshooting

- If login fails after changing `AUTH_SECRET`, clear browser cookies and sign in again.
- If tables are missing, run `npm run db:migrate`.
- If demo data is missing, run `npm run db:seed`.
- If the app cannot build, run `npm run lint` and `npm run build` locally to inspect errors.
