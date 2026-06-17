-- Week 2 migration: booking workflow, messaging, reviews, admin support.
-- Run this in the Supabase SQL editor for existing GoRent projects.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'disabled');
  end if;

  if exists (select 1 from pg_type where typname = 'car_status') then
    alter type public.car_status add value if not exists 'disabled';
    alter type public.car_status add value if not exists 'rented';
  end if;
end $$;

alter table public.profiles
  add column if not exists account_status public.account_status not null default 'active';

alter table public.messages
  add column if not exists car_id uuid references public.cars(id) on delete set null;

alter table public.reviews
  add column if not exists renter_id uuid references public.profiles(id) on delete cascade,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

update public.reviews r
set
  renter_id = coalesce(r.renter_id, b.renter_id),
  owner_id = coalesce(r.owner_id, b.owner_id)
from public.bookings b
where r.booking_id = b.id
  and (r.renter_id is null or r.owner_id is null);

alter table public.reviews
  alter column renter_id set not null,
  alter column owner_id set not null;

alter table public.reviews
  drop constraint if exists reviews_distinct_people,
  drop constraint if exists reviews_one_per_pair,
  drop constraint if exists reviews_one_per_booking;

alter table public.reviews
  add constraint reviews_distinct_people check (renter_id <> owner_id),
  add constraint reviews_one_per_booking unique (booking_id);

alter table public.bookings
  drop constraint if exists bookings_valid_dates,
  drop constraint if exists bookings_distinct_people;

alter table public.bookings
  add constraint bookings_valid_dates check (end_date >= start_date),
  add constraint bookings_distinct_people check (owner_id <> renter_id);

create index if not exists messages_car_id_idx on public.messages(car_id);
create index if not exists reviews_owner_id_idx on public.reviews(owner_id);
create index if not exists reviews_renter_id_idx on public.reviews(renter_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and account_status = 'active'
  );
$$;

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Available cars are public" on public.cars;
create policy "Available cars are public"
on public.cars for select
using (status = 'available' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "Owners can update cars" on public.cars;
create policy "Owners can update cars"
on public.cars for update
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Owners can delete cars" on public.cars;
create policy "Owners can delete cars"
on public.cars for delete
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Booking participants can view bookings" on public.bookings;
create policy "Booking participants can view bookings"
on public.bookings for select
to authenticated
using (owner_id = auth.uid() or renter_id = auth.uid() or public.is_admin());

drop policy if exists "Renters can request bookings" on public.bookings;
create policy "Renters can request bookings"
on public.bookings for insert
to authenticated
with check (
  renter_id = auth.uid()
  and owner_id <> auth.uid()
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = owner_id
      and c.status = 'available'
  )
);

drop policy if exists "Booking participants can update bookings" on public.bookings;
create policy "Booking participants can update bookings"
on public.bookings for update
to authenticated
using (owner_id = auth.uid() or renter_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or renter_id = auth.uid() or public.is_admin());

drop policy if exists "Message participants can view messages" on public.messages;
create policy "Message participants can view messages"
on public.messages for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and receiver_id <> auth.uid()
  and (
    booking_id is not null
    or car_id is not null
  )
);

drop policy if exists "Receivers can mark messages read" on public.messages;
create policy "Receivers can mark messages read"
on public.messages for update
to authenticated
using (receiver_id = auth.uid() or public.is_admin())
with check (receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Booking participants can create reviews" on public.reviews;
create policy "Booking participants can create reviews"
on public.reviews for insert
to authenticated
with check (
  renter_id = auth.uid()
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.status = 'completed'
      and b.car_id = car_id
      and b.renter_id = renter_id
      and b.owner_id = owner_id
  )
);

drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews"
on public.reviews for delete
to authenticated
using (public.is_admin());
