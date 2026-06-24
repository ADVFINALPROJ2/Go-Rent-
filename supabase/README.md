# GoRent Supabase Setup

Run `schema.sql` in the Supabase SQL editor or through the Supabase CLI after creating a Supabase project.

The schema creates:
- `profiles` linked to Supabase Auth users
- `cars` owned by profiles, with image URL support
- `bookings` between owners and renters
- `messages` between booking participants
- `reviews` for completed rentals
- `car-images` storage bucket policies using `{owner_id}/{file-name}` object paths

Week 2 additions support:
- booking requests and status tracking with `pending`, `approved`, `declined`, `completed`, and `cancelled`
- direct messages tied to either a booking or a car
- renter reviews for completed bookings with one review per booking
- admin users through `profiles.role = 'admin'`
- disabled accounts through `profiles.account_status`
- listing states for available, disabled, and rented cars

Required app environment variables are listed in `.env.example` and
`.env.local.example`.

## Local environment setup

Create a local-only `.env.local` file before testing Supabase-backed flows:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use the values from the Supabase project settings. Do not commit `.env.local`
or real Supabase secrets.

`SUPABASE_SERVICE_ROLE_KEY` appears in `.env.local.example` for future
server/admin tasks, but the current browser app flow only requires
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Recommended SQL application order

For a fresh Supabase database:

1. Run `supabase/schema.sql`.

For an existing database that already has the Day 1 schema but is missing the
profile `location` or `bio` fields:

1. Run `supabase/add-profile-fields.sql`.
2. Run `supabase/week2-schema-updates.sql`.

For an existing database that already has profile `location` and `bio` fields
but does not have Week 2 booking, messaging, review, and admin support:

1. Run `supabase/week2-schema-updates.sql`.
2. Run `supabase/final-security-rbac-booking-fixes.sql`.

For an existing database that already has Week 2 support but needs the final
RBAC and booking transition hardening:

1. Run `supabase/final-security-rbac-booking-fixes.sql`.

## Required migration for existing Supabase projects

If the GoRent database was created before profile management was merged, run
`supabase/add-profile-fields.sql` in the Supabase SQL editor. It adds the
`location` and `bio` columns used by the profile view and edit pages.

Fresh databases can run `supabase/schema.sql`, which already includes those
profile fields.

## Required migration for Week 2 features

If the GoRent database was created before booking, messaging, review, and admin
management work began, run `supabase/week2-schema-updates.sql` in the Supabase
SQL editor.

That migration adds:
- `profiles.account_status`
- `disabled` and `rented` car status values
- optional `messages.car_id`
- `reviews.renter_id` and `reviews.owner_id`
- indexes for message and review lookups
- an `is_admin()` helper
- RLS updates for admin access, booking requests, messages, and reviews

Fresh databases only need `supabase/schema.sql`.

## Required migration for final RBAC and booking security

Before the final live demo, existing Supabase projects should run
`supabase/final-security-rbac-booking-fixes.sql`.

That migration:
- requires an active owner profile for car insert/update/delete policies
- keeps admin car management access through `public.is_admin()`
- replaces broad booking participant update access with status-specific policies
- allows owners to approve/decline pending bookings
- allows owners to mark approved bookings as completed
- allows renters to cancel only their own pending bookings
- adds a trigger that blocks client updates to booking fields other than status
