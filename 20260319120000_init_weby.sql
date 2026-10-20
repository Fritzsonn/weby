-- Weby initial schema + RLS
-- Apply with: supabase db push   OR run in SQL editor
-- Never put the service role key in the mobile app.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username text not null unique,
  bio text,
  avatar_url text,
  interests text[] not null default '{}',
  languages text[] not null default '{}',
  birth_year int check (birth_year is null or (birth_year > 1900 and birth_year < 2100)),
  city text,
  show_age boolean not null default false,
  show_city boolean not null default true,
  show_upcoming_events boolean not null default true,
  allow_friend_requests boolean not null default true,
  onboarding_complete boolean not null default false,
  points int not null default 0 check (points >= 0),
  level int not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ---------------------------------------------------------------------------
-- Events (provider-ready)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source text not null default 'manual' check (source in ('sample', 'manual', 'provider')),
  title text not null,
  description text not null default '',
  category text not null,
  image_url text not null,
  venue_name text not null,
  address text not null default '',
  city text not null,
  latitude double precision,
  longitude double precision,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_category_idx on public.events (category);
create index if not exists events_city_idx on public.events (city);

create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('going', 'interested', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists event_attendees_user_idx on public.event_attendees (user_id);
create index if not exists event_attendees_event_status_idx on public.event_attendees (event_id, status);

create table if not exists public.saved_events (
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

-- ---------------------------------------------------------------------------
-- Friendship
-- ---------------------------------------------------------------------------
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

create unique index if not exists friend_requests_pending_unique
  on public.friend_requests (from_user_id, to_user_id)
  where status = 'pending';

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'event_group')),
  title text,
  event_id uuid references public.events (id) on delete cascade,
  event_group_id uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 4000),
  message_type text not null default 'text'
    check (message_type in ('text', 'system', 'poll', 'icebreaker')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Event groups (backend-scheduled)
-- ---------------------------------------------------------------------------
create table if not exists public.event_groups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  name text not null,
  language text,
  age_band text,
  interest_tags text[] not null default '{}',
  opens_at timestamptz not null,
  max_members int not null default 30 check (max_members between 2 and 40),
  created_at timestamptz not null default now()
);

alter table public.conversations
  drop constraint if exists conversations_event_group_id_fkey;
alter table public.conversations
  add constraint conversations_event_group_id_fkey
  foreign key (event_group_id) references public.event_groups (id) on delete set null;

create table if not exists public.event_group_members (
  event_group_id uuid not null references public.event_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (event_group_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Meetups
-- ---------------------------------------------------------------------------
create table if not exists public.meetups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  meeting_point text not null,
  meets_at timestamptz not null,
  max_attendees int,
  created_at timestamptz not null default now()
);

create table if not exists public.meetup_members (
  meetup_id uuid not null references public.meetups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (meetup_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Memories / albums
-- ---------------------------------------------------------------------------
create table if not exists public.event_albums (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  uploads_open_until timestamptz not null,
  is_read_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.event_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.event_albums (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  caption text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected', 'flagged')),
  like_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.photo_likes (
  photo_id uuid not null references public.event_photos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Safety / gamification / notifications
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('user', 'message', 'photo', 'meetup')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  action text not null,
  points int not null check (points <> 0),
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists points_transactions_dedupe_idx
  on public.points_transactions (user_id, action, reference_type, reference_id)
  where reference_id is not null;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_conversation_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members m
    where m.conversation_id = cid
      and m.user_id = auth.uid()
      and m.left_at is null
  );
$$;

create or replace function public.is_event_going(eid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_attendees a
    where a.event_id = eid
      and a.user_id = auth.uid()
      and a.status = 'going'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Weby Member'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'member'), '[^a-zA-Z0-9_]', '_', 'g'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.saved_events enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.blocked_users enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.event_groups enable row level security;
alter table public.event_group_members enable row level security;
alter table public.meetups enable row level security;
alter table public.meetup_members enable row level security;
alter table public.event_albums enable row level security;
alter table public.event_photos enable row level security;
alter table public.photo_likes enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.points_transactions enable row level security;

-- Profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated
  using (
    not exists (
      select 1 from public.blocked_users b
      where (b.blocker_id = auth.uid() and b.blocked_id = profiles.id)
         or (b.blocker_id = profiles.id and b.blocked_id = auth.uid())
    )
  );

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Events
create policy "Public events are readable"
  on public.events for select to authenticated
  using (is_public = true or created_by = auth.uid());

create policy "Users can create manual events"
  on public.events for insert to authenticated
  with check (created_by = auth.uid());

-- Attendance
create policy "Attendees readable for going events"
  on public.event_attendees for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_event_going(event_id)
  );

create policy "Users manage own attendance"
  on public.event_attendees for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users update own attendance"
  on public.event_attendees for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Saved
create policy "Users manage saved events"
  on public.saved_events for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Friend requests
create policy "Participants read friend requests"
  on public.friend_requests for select to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "Users send friend requests"
  on public.friend_requests for insert to authenticated
  with check (from_user_id = auth.uid());

create policy "Participants update friend requests"
  on public.friend_requests for update to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

-- Friendships
create policy "Friends can read friendships"
  on public.friendships for select to authenticated
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

-- Blocked
create policy "Users manage blocks"
  on public.blocked_users for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- Conversations / messages
create policy "Members read conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_member(id));

create policy "Members read membership"
  on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id) or user_id = auth.uid());

create policy "Members update own membership"
  on public.conversation_members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Members read messages"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));

create policy "Members send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );

-- Event groups: members can read once open (opens_at enforced in edge function + policy)
create policy "Members read event groups after open"
  on public.event_groups for select to authenticated
  using (
    exists (
      select 1 from public.event_group_members g
      where g.event_group_id = event_groups.id
        and g.user_id = auth.uid()
        and g.left_at is null
    )
    and opens_at <= now()
  );

create policy "Members read group membership"
  on public.event_group_members for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.event_group_members g
      where g.event_group_id = event_group_members.event_group_id
        and g.user_id = auth.uid()
        and g.left_at is null
    )
  );

create policy "Members can leave groups"
  on public.event_group_members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Meetups
create policy "Going attendees read meetups"
  on public.meetups for select to authenticated
  using (public.is_event_going(event_id));

create policy "Going attendees create meetups"
  on public.meetups for insert to authenticated
  with check (created_by = auth.uid() and public.is_event_going(event_id));

create policy "Going attendees read meetup members"
  on public.meetup_members for select to authenticated
  using (
    exists (
      select 1 from public.meetups m
      where m.id = meetup_id and public.is_event_going(m.event_id)
    )
  );

create policy "Going attendees join meetups"
  on public.meetup_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.meetups m
      where m.id = meetup_id and public.is_event_going(m.event_id)
    )
  );

create policy "Users leave meetups"
  on public.meetup_members for delete to authenticated
  using (user_id = auth.uid());

-- Albums / photos
create policy "Going attendees read albums"
  on public.event_albums for select to authenticated
  using (public.is_event_going(event_id));

create policy "Going attendees read approved or own photos"
  on public.event_photos for select to authenticated
  using (
    public.is_event_going(event_id)
    and (moderation_status = 'approved' or uploader_id = auth.uid())
  );

create policy "Going attendees upload while open"
  on public.event_photos for insert to authenticated
  with check (
    uploader_id = auth.uid()
    and public.is_event_going(event_id)
    and exists (
      select 1 from public.event_albums a
      where a.id = album_id
        and a.event_id = event_photos.event_id
        and a.is_read_only = false
        and a.uploads_open_until > now()
    )
  );

create policy "Users manage own likes"
  on public.photo_likes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Reports / notifications / points
create policy "Users create reports"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "Users read own reports"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid());

create policy "Users read own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "Users update own notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users read own points"
  on public.points_transactions for select to authenticated
  using (user_id = auth.uid());

-- Points inserts are service-role / edge-function only (no insert policy for authenticated)

-- ---------------------------------------------------------------------------
-- Storage bucket (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-memories', 'event-memories', false)
on conflict (id) do nothing;

create policy "Attendees can upload memory objects"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-memories'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Attendees can read own uploads or via signed URLs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'event-memories'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Note: broader attendee read should use short-lived signed URLs issued by
-- an edge function after verifying event attendance + moderation status.
