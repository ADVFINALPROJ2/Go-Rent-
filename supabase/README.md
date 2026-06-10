# GoRent Supabase Setup

Run `schema.sql` in the Supabase SQL editor or through the Supabase CLI after creating a Supabase project.

The schema creates:
- `profiles` linked to Supabase Auth users
- `cars` owned by profiles, with image URL support
- `bookings` between owners and renters
- `messages` between booking participants
- `reviews` for completed rentals
- `car-images` storage bucket policies using `{owner_id}/{file-name}` object paths

Required app environment variables are listed in `.env.example`.
