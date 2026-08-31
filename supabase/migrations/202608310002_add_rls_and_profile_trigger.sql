-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;


-- =========================================================
-- Profiles policies
-- =========================================================

create policy "Public can view profiles"
on public.profiles
for select
to anon, authenticated
using (true);


create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);


create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- =========================================================
-- Availability policies
-- =========================================================

create policy "Public can view availability"
on public.availability
for select
to anon, authenticated
using (true);


create policy "Owners can create their own availability"
on public.availability
for insert
to authenticated
with check (auth.uid() = owner_id);


create policy "Owners can update their own availability"
on public.availability
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);


create policy "Owners can delete their own availability"
on public.availability
for delete
to authenticated
using (auth.uid() = owner_id);


-- =========================================================
-- Booking policies
-- =========================================================

create policy "Public can create pending bookings"
on public.bookings
for insert
to anon, authenticated
with check (status = 'pending');


create policy "Owners can view their own bookings"
on public.bookings
for select
to authenticated
using (auth.uid() = owner_id);


create policy "Owners can update their own bookings"
on public.bookings
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);


-- =========================================================
-- Automatically create profile after signup
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    surname,
    username,
    business_title
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'surname',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'business_title'
  );

  return new;
end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();