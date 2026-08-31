-- =========================================================
-- Get unavailable booking slots
-- =========================================================

create or replace function public.get_unavailable_booking_slots(
  p_owner_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  booking_date date,
  start_time time
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.booking_date,
    b.start_time
  from public.bookings b
  where b.owner_id = p_owner_id
    and b.booking_date between p_start_date and p_end_date
    and b.status in ('pending', 'accepted');
$$;

revoke all
on function public.get_unavailable_booking_slots(uuid, date, date)
from public;

grant execute
on function public.get_unavailable_booking_slots(uuid, date, date)
to anon, authenticated;


-- =========================================================
-- Create booking request
-- =========================================================

create or replace function public.create_booking_request(
  p_owner_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_booking_date date,
  p_start_time time,
  p_reason text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_end_time time;
  v_reference_id text;
begin
  v_end_time := (p_start_time + interval '1 hour')::time;

  if trim(p_customer_name) = '' then
    raise exception 'Name is required';
  end if;

  if trim(p_customer_email) = '' then
    raise exception 'Email is required';
  end if;

  if p_booking_date < current_date then
    raise exception 'Cannot book a date in the past';
  end if;

  if not exists (
    select 1
    from public.availability a
    where a.owner_id = p_owner_id
      and a.day_of_week =
        extract(dow from p_booking_date)::integer
      and p_start_time >= a.start_time
      and v_end_time <= a.end_time
  ) then
    raise exception 'Selected time is not available';
  end if;

  insert into public.bookings (
    owner_id,
    customer_name,
    customer_email,
    booking_date,
    start_time,
    end_time,
    reason,
    status
  )
  values (
    p_owner_id,
    trim(p_customer_name),
    trim(p_customer_email),
    p_booking_date,
    p_start_time,
    v_end_time,
    nullif(trim(p_reason), ''),
    'pending'
  )
  returning reference_id into v_reference_id;

  return v_reference_id;

exception
  when unique_violation then
    raise exception
      'That appointment has already been requested. Please choose another time.';
end;
$$;

revoke all
on function public.create_booking_request(
  uuid,
  text,
  text,
  date,
  time,
  text
)
from public;

grant execute
on function public.create_booking_request(
  uuid,
  text,
  text,
  date,
  time,
  text
)
to anon, authenticated;


-- =========================================================
-- Get booking status using reference ID
-- =========================================================

create or replace function public.get_booking_status(
  p_reference_id text
)
returns table (
  owner_id uuid,
  booking_date date,
  start_time time,
  end_time time,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.owner_id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.status
  from public.bookings b
  where b.reference_id = upper(trim(p_reference_id))
  limit 1;
$$;

revoke all
on function public.get_booking_status(text)
from public;

grant execute
on function public.get_booking_status(text)
to anon, authenticated;


-- =========================================================
-- Cancel booking using reference ID + customer email
-- =========================================================

create or replace function public.cancel_booking_request(
  p_reference_id text,
  p_customer_email text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  update public.bookings
  set status = 'cancelled'
  where reference_id = upper(trim(p_reference_id))
    and lower(customer_email) =
      lower(trim(p_customer_email))
    and status in ('pending', 'accepted')
  returning status into v_status;

  return v_status;
end;
$$;

revoke all
on function public.cancel_booking_request(text, text)
from public;

grant execute
on function public.cancel_booking_request(text, text)
to anon, authenticated;