create extension if not exists "pgcrypto";

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  meta_description text,
  excerpt text,
  category text,
  featured_image_url text,
  body jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  author_name text default 'AssistantAI',
  seo_keywords text[] default '{}'
);

create index if not exists blog_posts_status_published_at_idx on public.blog_posts(status, published_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);

alter table public.blog_posts enable row level security;
