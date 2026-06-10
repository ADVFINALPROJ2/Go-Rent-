create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type public.profile_role as enum ('owner', 'renter', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'car_status') then
    create type public.car_status as enum ('draft', 'available', 'unavailable', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum ('pending', 'approved', 'declined', 'cancelled', 'completed');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  location text,
  bio text,
  role public.profile_role not null default 'renter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  make text not null,
  model text not null,
  year integer not null check (year between 1980 and extract(year from now())::integer + 1),
  location text not null,
  daily_rate numeric(10, 2) not null check (daily_rate > 0),
  status public.car_status not null default 'draft',
  image_urls text[] not null default '{}',
  seats integer check (seats is null or seats > 0),
  transmission text,
  fuel_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_price numeric(10, 2) not null check (total_price >= 0),
  status public.booking_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_dates check (end_date >= start_date),
  constraint bookings_distinct_people check (owner_id <> renter_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_distinct_people check (sender_id <> receiver_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_distinct_people check (reviewer_id <> reviewee_id),
  constraint reviews_one_per_pair unique (booking_id, reviewer_id, reviewee_id)
);

create index if not exists cars_owner_id_idx on public.cars(owner_id);
create index if not exists cars_status_location_idx on public.cars(status, location);
create index if not exists bookings_car_id_idx on public.bookings(car_id);
create index if not exists bookings_owner_id_idx on public.bookings(owner_id);
create index if not exists bookings_renter_id_idx on public.bookings(renter_id);
create index if not exists messages_booking_id_idx on public.messages(booking_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists reviews_car_id_idx on public.reviews(car_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_cars_updated_at on public.cars;
create trigger set_cars_updated_at
before update on public.cars
for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when new.raw_user_meta_data ->> 'role' in ('owner', 'renter')
        then (new.raw_user_meta_data ->> 'role')::public.profile_role
      else 'renter'::public.profile_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Available cars are public" on public.cars;
create policy "Available cars are public"
on public.cars for select
using (status = 'available' or owner_id = auth.uid());

drop policy if exists "Owners can insert cars" on public.cars;
create policy "Owners can insert cars"
on public.cars for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can update cars" on public.cars;
create policy "Owners can update cars"
on public.cars for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete cars" on public.cars;
create policy "Owners can delete cars"
on public.cars for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Booking participants can view bookings" on public.bookings;
create policy "Booking participants can view bookings"
on public.bookings for select
to authenticated
using (owner_id = auth.uid() or renter_id = auth.uid());

drop policy if exists "Renters can request bookings" on public.bookings;
create policy "Renters can request bookings"
on public.bookings for insert
to authenticated
with check (renter_id = auth.uid() and owner_id <> auth.uid());

drop policy if exists "Booking participants can update bookings" on public.bookings;
create policy "Booking participants can update bookings"
on public.bookings for update
to authenticated
using (owner_id = auth.uid() or renter_id = auth.uid())
with check (owner_id = auth.uid() or renter_id = auth.uid());

drop policy if exists "Message participants can view messages" on public.messages;
create policy "Message participants can view messages"
on public.messages for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages for insert
to authenticated
with check (sender_id = auth.uid() and receiver_id <> auth.uid());

drop policy if exists "Receivers can mark messages read" on public.messages;
create policy "Receivers can mark messages read"
on public.messages for update
to authenticated
using (receiver_id = auth.uid())
with check (receiver_id = auth.uid());

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public"
on public.reviews for select
using (true);

drop policy if exists "Booking participants can create reviews" on public.reviews;
create policy "Booking participants can create reviews"
on public.reviews for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.status = 'completed'
      and (b.owner_id = auth.uid() or b.renter_id = auth.uid())
  )
);

insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do nothing;

drop policy if exists "Car images are publicly readable" on storage.objects;
create policy "Car images are publicly readable"
on storage.objects for select
using (bucket_id = 'car-images');

drop policy if exists "Owners can upload car images" on storage.objects;
create policy "Owners can upload car images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'car-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners can update car images" on storage.objects;
create policy "Owners can update car images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'car-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'car-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners can delete car images" on storage.objects;
create policy "Owners can delete car images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'car-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
