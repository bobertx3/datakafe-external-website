-- Enable pgvector
create extension if not exists vector;

-- Memories table
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  baby_name text not null default 'Julian',
  type text not null check (type in ('text', 'voice', 'image', 'screenshot')),
  content text not null,
  raw_url text,
  category text not null default 'Other' check (category in ('Medical', 'Food & Diet', 'Routines', 'Milestones', 'Vitals', 'Sleep', 'Other')),
  tags text[] default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Add index once you have 1000+ memories for performance
-- create index memories_embedding_idx on memories using hnsw (embedding vector_cosine_ops);

-- Function to search memories by semantic similarity
create or replace function match_memories(
  query_embedding vector(1536),
  match_count int default 8
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
    id,
    content,
    category,
    tags,
    created_at,
    1 - (embedding <=> query_embedding) as similarity
  from memories
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
