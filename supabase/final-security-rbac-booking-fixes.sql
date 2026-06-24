-- Final security hardening for owner RBAC and booking status transitions.
-- Apply this after supabase/schema.sql or supabase/week2-schema-updates.sql.

create or replace function public.enforce_booking_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.car_id is distinct from old.car_id
    or new.owner_id is distinct from old.owner_id
    or new.renter_id is distinct from old.renter_id
    or new.start_date is distinct from old.start_date
    or new.end_date is distinct from old.end_date
    or new.total_price is distinct from old.total_price
    or new.message is distinct from old.message then
    raise exception 'Only booking status updates are allowed from the client.';
  end if;

  if old.owner_id = auth.uid()
    and old.status = 'pending'
    and new.status in ('approved', 'declined') then
    return new;
  end if;

  if old.owner_id = auth.uid()
    and old.status = 'approved'
    and new.status = 'completed' then
    return new;
  end if;

  if old.renter_id = auth.uid()
    and old.status = 'pending'
    and new.status = 'cancelled' then
    return new;
  end if;

  raise exception 'Booking status transition is not allowed.';
end;
$$;

drop trigger if exists enforce_booking_status_transition on public.bookings;
create trigger enforce_booking_status_transition
before update on public.bookings
for each row execute function public.enforce_booking_status_transition();

drop policy if exists "Owners can insert cars" on public.cars;
create policy "Owners can insert cars"
on public.cars for insert
to authenticated
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'owner'
        and p.account_status = 'active'
    )
  )
);

drop policy if exists "Owners can update cars" on public.cars;
create policy "Owners can update cars"
on public.cars for update
to authenticated
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'owner'
        and p.account_status = 'active'
    )
  )
)
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'owner'
        and p.account_status = 'active'
    )
  )
);

drop policy if exists "Owners can delete cars" on public.cars;
create policy "Owners can delete cars"
on public.cars for delete
to authenticated
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'owner'
        and p.account_status = 'active'
    )
  )
);

drop policy if exists "Renters can request bookings" on public.bookings;
create policy "Renters can request bookings"
on public.bookings for insert
to authenticated
with check (
  status = 'pending'
  and renter_id = auth.uid()
  and owner_id <> auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'renter'
      and p.account_status = 'active'
  )
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = owner_id
      and c.status = 'available'
  )
);

drop policy if exists "Booking participants can update bookings" on public.bookings;
drop policy if exists "Owners can approve or decline pending bookings" on public.bookings;
drop policy if exists "Owners can complete approved bookings" on public.bookings;
drop policy if exists "Renters can cancel pending bookings" on public.bookings;
drop policy if exists "Admins can update bookings" on public.bookings;

create policy "Owners can approve or decline pending bookings"
on public.bookings for update
to authenticated
using (
  status = 'pending'
  and owner_id = auth.uid()
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = auth.uid()
  )
)
with check (
  status in ('approved', 'declined')
  and owner_id = auth.uid()
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = auth.uid()
  )
);

create policy "Owners can complete approved bookings"
on public.bookings for update
to authenticated
using (
  status = 'approved'
  and owner_id = auth.uid()
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = auth.uid()
  )
)
with check (
  status = 'completed'
  and owner_id = auth.uid()
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.owner_id = auth.uid()
  )
);

create policy "Renters can cancel pending bookings"
on public.bookings for update
to authenticated
using (
  status = 'pending'
  and renter_id = auth.uid()
)
with check (
  status = 'cancelled'
  and renter_id = auth.uid()
);

create policy "Admins can update bookings"
on public.bookings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
