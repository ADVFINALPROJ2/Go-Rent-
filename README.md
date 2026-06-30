# GoRent

GoRent is a peer-to-peer car rental web application built for Addis Ababa. It lets car owners list vehicles, renters browse and request cars, users message each other, renters leave reviews, and admins monitor platform activity.

The current version runs locally without Supabase or any external database service. It uses SQLite with Drizzle ORM and local email/password authentication.

## Key Features

- User registration, login, logout, and role-based redirects
- Local email/password authentication with HTTP-only session cookies
- Renter, owner, and admin roles
- User profile view/edit flow
- Car listing creation, editing, and status management
- Browse cars with search and price filtering
- Car details page with booking, messaging, and reviews
- Booking request workflow
- Owner approve, decline, and mark-completed actions
- Renter booking status display and cancellation
- Messages inbox and reply flow
- Reviews and average rating display
- Admin dashboard for users, listings, and platform overview
- Addis Ababa localized UI with Birr pricing
- Dark/light mode UI styling
- Docker and deployment documentation

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** Tailwind CSS and shadcn-style components
- **Database:** SQLite
- **ORM:** Drizzle ORM and Drizzle Kit
- **Authentication:** Local email/password auth with bcrypt and HTTP-only cookies
- **Icons:** Lucide React
- **Deployment support:** Dockerfile and deployment guide

## Project Structure

```text
src/app              Next.js routes and pages
src/components       Shared UI, layout, cards, forms, dashboards
src/db               SQLite/Drizzle client and schema
src/lib/auth         Local session and password auth helpers
src/lib/actions      Drizzle-backed server actions
src/lib              Utilities, routes, formatting helpers
drizzle              Generated SQLite migrations
scripts/seed.ts      Demo users and sample data
data                 Local SQLite database files, ignored by Git
```

## Requirements

- Node.js
- npm

No Supabase setup is required for the current version.

## Local Setup

From the project folder:

```bash
npm install
copy .env.local.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Open the app:

[http://localhost:3000](http://localhost:3000)

For macOS/Linux, use this instead of the Windows `copy` command:

```bash
cp .env.local.example .env.local
```

## Environment Variables

`.env.local` should contain:

```env
AUTH_SECRET=change-this-local-development-secret
SQLITE_DB_PATH=./data/gorent.sqlite
```

`AUTH_SECRET` signs the local session cookie. Use a stronger unique value for production or final deployment.

`SQLITE_DB_PATH` controls where the local SQLite database file is stored. The default database location is:

```text
data/gorent.sqlite
```

The `data/` folder is ignored by Git.

## Demo Users

Run `npm run db:seed` before using these accounts.

All seeded users use the password `Password123!`.

- Admin: `admin@gorent.test`
- Owner: `owner@gorent.test`
- Renter: `renter@gorent.test`

## Important Links

- Home: [http://localhost:3000](http://localhost:3000)
- Cars: [http://localhost:3000/browse](http://localhost:3000/browse)
- Register: [http://localhost:3000/register](http://localhost:3000/register)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Profile: [http://localhost:3000/profile](http://localhost:3000/profile)
- Messages: [http://localhost:3000/messages](http://localhost:3000/messages)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)
- Admin Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/browse` | Browse and filter cars |
| `/how-it-works` | Explains renter and owner workflows |
| `/become-an-owner` | Owner onboarding/marketing page |
| `/reviews` | Community reviews page |
| `/contact` | Contact/support page |
| `/register` | Create account |
| `/login` | Sign in |
| `/profile` | View profile |
| `/profile/edit` | Edit profile |
| `/cars/[id]` | Car details |
| `/owner/dashboard` | Owner dashboard |
| `/owner/dashboard/cars` | Owner car listings |
| `/owner/dashboard/cars/new` | Add car listing |
| `/owner/dashboard/cars/[id]/edit` | Edit car listing |
| `/renter/dashboard` | Renter dashboard |
| `/messages` | Messages inbox |
| `/admin` | Admin portal dashboard |
| `/admin/login` | Admin-only portal login |

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

## Database Workflow

Generate Drizzle migration files after schema changes:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Seed demo data:

```bash
npm run db:seed
```

Open Drizzle Studio:

```bash
npm run db:studio
```

## Demo Flow

For a complete demonstration:

1. Start the app with `npm run dev`.
2. Log in as the owner.
3. Create or edit a car listing.
4. Log out.
5. Log in as the renter.
6. Browse cars and open a car details page.
7. Submit a booking request.
8. Send a message to the owner.
9. Log out.
10. Log in as the owner.
11. Approve, decline, or complete a booking request.
12. Log in as the renter and check booking status.
13. Leave a review after a completed booking.
14. Log in as admin and open the admin dashboard.

## Docker

Build the Docker image:

```bash
docker build -t gorent .
```

Run the container:

```bash
docker run -p 3000:3000 -e AUTH_SECRET=change-this-secret -e SQLITE_DB_PATH=./data/gorent.sqlite gorent
```

For production-like Docker use, mount persistent storage for the SQLite database so data survives container restarts.

## Deployment Notes

SQLite works well for local demos and simple deployments, but production hosting must provide persistent disk storage. If deploying to a stateless platform, either mount persistent storage or migrate the Drizzle schema to a managed database.

See `DEPLOYMENT.md` for more deployment guidance.

## Notes

- `.env.local` is ignored by Git and should not be committed.
- `data/` is ignored by Git because it contains local SQLite database files.
- The project no longer uses Supabase at runtime.
- Run `npm run lint` and `npm run build` before final submission.
