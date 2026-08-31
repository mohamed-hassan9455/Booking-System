create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  surname text not null,
  username text unique not null,
  business_title text,
  created_at timestamptz default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now(),

  constraint availability_valid_time
    check (start_time < end_time)
);

create unique index if not exists availability_unique_range
on public.availability (
  owner_id,
  day_of_week,
  start_time,
  end_time
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  reference_id text unique not null
    default upper(
      substr(
        replace(gen_random_uuid()::text, '-', ''),
        1,
        10
      )
    ),

  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,

  customer_name text not null,
  customer_email text not null,

  booking_date date not null,
  start_time time not null,
  end_time time not null,

  reason text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'rejected',
        'cancelled'
      )
    ),

  created_at timestamptz default now(),

  constraint booking_valid_time
    check (start_time < end_time)
);

create unique index if not exists bookings_unique_active_slot
on public.bookings (
  owner_id,
  booking_date,
  start_time
)
where status in ('pending', 'accepted');