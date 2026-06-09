# GoRent

GoRent is a peer-to-peer car rental web app where owners list vehicles and renters browse cars, request bookings, message owners, and review completed rentals.

## Stack

- Monolithic MVC-style Next.js application
- Next.js App Router with TypeScript
- Tailwind CSS
- shadcn/ui-style component setup
- Supabase Auth, PostgreSQL, and Storage

## Local Setup

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill `.env.local` with values from the Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Available Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Project Structure

- `src/app` contains route pages and the global layout.
- `src/components/layout` contains shared navigation and footer shell.
- `src/components/ui` contains shadcn/ui-style primitives used by pages.
- `src/lib/supabase` contains typed Supabase client factories.
- `src/lib/routes.ts` contains shared navigation route definitions.
- `supabase/schema.sql` contains Day 1 database tables, policies, triggers, and storage bucket setup.
- `.env.example` and `.env.local.example` document required environment variables.

## Day 1 Routes

- `/` Home
- `/register` Register
- `/login` Login
- `/browse` Browse Cars
- `/cars/[id]` Car Details
- `/owner/dashboard` Owner Dashboard
- `/renter/dashboard` Renter Dashboard
- `/profile` Profile

## Supabase Schema

Run `supabase/schema.sql` in the Supabase SQL editor or through the Supabase CLI. The schema creates:

- `profiles`
- `cars`
- `bookings`
- `messages`
- `reviews`
- `car-images` storage bucket policies

Car image uploads should use object paths in this format:

```text
{owner_id}/{file-name}
```

## Branch Workflow

This setup work lives on `setup-supabase-foundation`. Open a pull request from `setup-supabase-foundation` into `main` after checks pass.
