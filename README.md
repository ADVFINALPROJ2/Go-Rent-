# GoRent

GoRent is a peer-to-peer car rental web app where owners list vehicles and renters browse cars, request bookings, message owners, and review completed rentals.

## Stack

- Monolithic MVC-style Next.js application
- Next.js App Router with TypeScript
- Tailwind CSS
- shadcn/ui-style component setup
- SQLite local database
- Drizzle ORM and Drizzle Kit migrations
- Local email/password auth with HTTP-only session cookies

## Local Setup

```bash
npm install
copy .env.local.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local` should contain:

```env
AUTH_SECRET=change-this-local-development-secret
SQLITE_DB_PATH=./data/gorent.sqlite
```

The SQLite database file is created under `data/`, which is ignored by Git.

## Demo Users

All seeded users use the password `Password123!`.

- Admin: `admin@gorent.test`
- Owner: `owner@gorent.test`
- Renter: `renter@gorent.test`

## Available Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Project Structure

- `src/app` contains route pages and server actions.
- `src/components` contains shared UI, feature components, and dashboard shells.
- `src/db/schema.ts` contains the Drizzle schema for users, profiles, cars, bookings, messages, and reviews.
- `src/db/client.ts` opens the local SQLite database.
- `src/lib/auth` contains local auth/session helpers.
- `src/lib/actions` contains Drizzle-backed server actions.
- `drizzle/` contains generated SQLite migrations.
- `scripts/seed.ts` creates demo users and sample data.
- `.env.example` and `.env.local.example` document local environment variables.

## Main Routes

- `/` Home
- `/register` Register
- `/login` Login
- `/browse` Browse Cars
- `/cars/[id]` Car Details
- `/owner/dashboard` Owner Dashboard
- `/owner/dashboard/cars` Owner Listings
- `/owner/dashboard/cars/new` Add Car
- `/renter/dashboard` Renter Dashboard
- `/profile` Profile
- `/profile/edit` Edit Profile
- `/messages` Messages
- `/admin/dashboard` Admin Dashboard

## Database Notes

Local demo use does not require Supabase. Run `npm run db:migrate` after pulling schema changes, then `npm run db:seed` when you need fresh demo accounts and sample data.

For production, SQLite requires persistent storage. Use a Docker volume, persistent disk, or migrate the Drizzle schema to a managed database before deploying to a stateless platform.
