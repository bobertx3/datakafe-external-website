-- Babies table
create table if not exists babies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dob date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Who has access to which baby
create table if not exists baby_members (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references babies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique(baby_id, user_id)
);

-- Link memories to a baby and track who added them
alter table memories
  add column if not exists baby_id uuid references babies(id) on delete cascade,
  add column if not exists created_by uuid references auth.users(id);

-- ── RLS ──────────────────────────────────────────────────────────────
alter table babies enable row level security;
alter table baby_members enable row level security;
alter table memories enable row level security;

-- babies: visible to members
create policy "members can view baby"
  on babies for select
  using (
    exists (
      select 1 from baby_members
      where baby_members.baby_id = babies.id
      and baby_members.user_id = auth.uid()
    )
  );

-- babies: only owner can update
create policy "owner can update baby"
  on babies for update
  using (created_by = auth.uid());

-- babies: any authed user can create
create policy "authed users can create baby"
  on babies for insert
  with check (auth.uid() is not null);

-- baby_members: visible to members of the same baby
create policy "members can view other members"
  on baby_members for select
  using (
    exists (
      select 1 from baby_members bm
      where bm.baby_id = baby_members.baby_id
      and bm.user_id = auth.uid()
    )
  );

-- baby_members: owners can insert new members
create policy "owners can invite members"
  on baby_members for insert
  with check (
    exists (
      select 1 from baby_members bm
      where bm.baby_id = baby_members.baby_id
      and bm.user_id = auth.uid()
      and bm.role = 'owner'
    )
    or auth.uid() is not null -- allow self-join on first baby creation
  );

-- memories: members can read
create policy "members can view memories"
  on memories for select
  using (
    exists (
      select 1 from baby_members
      where baby_members.baby_id = memories.baby_id
      and baby_members.user_id = auth.uid()
    )
  );

-- memories: members can insert
create policy "members can add memories"
  on memories for insert
  with check (
    exists (
      select 1 from baby_members
      where baby_members.baby_id = memories.baby_id
      and baby_members.user_id = auth.uid()
    )
  );

-- ── Auto-link pending invites when a user signs up ───────────────────
create or replace function link_pending_invites()
returns trigger as $$
begin
  update baby_members
  set user_id = new.id
  where invited_email = new.email
  and user_id is null;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_user_created
  after insert on auth.users
  for each row execute function link_pending_invites();

-- Update match_memories to be RLS-aware
create or replace function match_memories(
  query_embedding vector(1536),
  match_count int default 8,
  p_baby_id uuid default null
)
returns table (
  id uuid,
  content text,
  category text,
  tags text[],
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    m.id,
    m.content,
    m.category,
    m.tags,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  from memories m
  where m.embedding is not null
    and (p_baby_id is null or m.baby_id = p_baby_id)
  order by m.embedding <=> query_embedding
  limit match_count;
$$;
