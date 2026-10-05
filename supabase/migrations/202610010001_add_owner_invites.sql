create table public.owner_invites (
  email text primary key,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

alter table public.owner_invites enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
begin
  normalized_email := lower(trim(new.email));

  if not exists (
    select 1
    from public.owner_invites
    where lower(email) = normalized_email
      and used_at is null
  ) then
    raise exception 'Owner signup is invite-only.';
  end if;

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

  update public.owner_invites
  set used_at = now()
  where lower(email) = normalized_email;

  return new;
end;
$$;