# GoRent Deployment Guide

## Prerequisites

- Node.js 20+
- npm
- A Supabase project
- Optional: Docker and Docker Compose
- Optional: Vercel account

## Environment variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL schema from [supabase/schema.sql](supabase/schema.sql).
3. If needed, apply the updates from [supabase/week2-schema-updates.sql](supabase/week2-schema-updates.sql).
4. Enable Supabase Auth and configure the email provider you want to use.
5. Copy the project URL and anon/service role keys into `.env.local`.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

## Production deployment

### Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables in the Vercel project settings.
4. Deploy.

### Docker

Build the image:

```bash
docker build -t gorent .
```

Run the container:

```bash
docker run --rm -p 3000:3000 --env-file .env.local gorent
```

## Troubleshooting

- If auth fails, confirm the Supabase URL and anon key are correct.
- If database calls fail, verify the schema and RLS policies were applied.
- If the app cannot build, run `npm run lint` and `npm run build` locally to inspect the error output.
