-- ============================================================
-- Lingua Lab 数据库结构
-- 在 Supabase 后台 SQL Editor 中一次性运行本脚本
-- 包含：数据表 + 行级安全策略(RLS) + 自动更新时间戳
-- ============================================================

-- 1. 用户档案（扩展 Supabase auth.users）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  level text default '中级（B1+）',
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 每周主题
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  title_en text,
  category text,
  intro text,
  difficulty text,
  objectives text[] default '{}',
  status text default 'planned', -- planned | active | completed
  created_at timestamptz default now()
);

-- 3. 学习材料（视频等）
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  title text,
  title_zh text,
  source text,
  url text,
  duration text,
  difficulty text,
  description text,
  objective text,
  transcript jsonb,          -- 分段文稿 [{start, en}]
  is_embeddable boolean default false,
  created_at timestamptz default now()
);

-- 4. 训练课次
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  mode text not null,          -- 'A' | 'B'
  status text default 'not_started', -- not_started | in_progress | completed
  current_step int default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. 录音
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  attempt int default 1,       -- 第几次尝试
  duration_seconds int,
  audio_path text,             -- Supabase Storage 路径
  transcript text,             -- 转写文本
  score int,                   -- AI 综合评分（标注为 AI 评估）
  created_at timestamptz default now()
);

-- 6. AI 反馈
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recording_id uuid references public.recordings(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  scores jsonb,                -- 六维评分
  top_issues jsonb,            -- Top3 问题
  transcript text,
  corrected text,
  improved text,
  expressions text[] default '{}',
  suggestions text[] default '{}',
  created_at timestamptz default now()
);

-- 7. 词汇收藏
create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expression text not null,
  meaning text,
  source_sentence text,
  example text,
  context text,
  source text default 'selection',  -- core | selection
  box int default 1,                -- 艾宾浩斯记忆盒（1-5）
  due_at timestamptz default now(), -- 下次复习时间
  last_reviewed timestamptz,
  review_count int default 0,
  created_at timestamptz default now()
);

-- 8. 高频错误档案
create table if not exists public.recurring_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text,
  description text,
  example text,
  correction text,
  count int default 1,
  created_at timestamptz default now()
);

-- 9. AI 对话历史
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  duration_minutes int,
  transcript jsonb,            -- [{role, text}]
  summary jsonb,               -- 课后报告
  created_at timestamptz default now()
);

-- 10. 进度记录
create table if not exists public.progress_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  metric text,                 -- fluency | grammar | vocab | naturalness | listening
  value int,                   -- AI 评估分数（0-100）
  is_ai_assessment boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 索引
-- ============================================================
create index if not exists idx_vocab_user on public.vocabulary_items(user_id);
create index if not exists idx_sessions_user on public.sessions(user_id);
create index if not exists idx_recordings_user on public.recordings(user_id);
create index if not exists idx_progress_user on public.progress_records(user_id);
create index if not exists idx_conversations_user on public.conversations(user_id);

-- ============================================================
-- 行级安全策略（RLS）—— 每个用户只能访问自己的数据
-- ============================================================
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.materials enable row level security;
alter table public.sessions enable row level security;
alter table public.recordings enable row level security;
alter table public.feedback enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.recurring_mistakes enable row level security;
alter table public.conversations enable row level security;
alter table public.progress_records enable row level security;

-- profiles：用户可读写自己的档案
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- topics
create policy "topics_all_own" on public.topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- materials
create policy "materials_all_own" on public.materials for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- sessions
create policy "sessions_all_own" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- recordings
create policy "recordings_all_own" on public.recordings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- feedback
create policy "feedback_all_own" on public.feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- vocabulary_items
create policy "vocab_all_own" on public.vocabulary_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- recurring_mistakes
create policy "mistakes_all_own" on public.recurring_mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations
create policy "conversations_all_own" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- progress_records
create policy "progress_all_own" on public.progress_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 触发器：自动创建用户档案 & 更新时间戳
-- ============================================================

-- 新用户注册时自动建 profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at 自动更新
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_sessions on public.sessions;
create trigger touch_sessions before update on public.sessions
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- Storage 桶（用于录音上传）
-- ============================================================
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

-- 录音桶的访问策略：仅本人可读写
create policy "recordings_owner_read" on storage.objects
  for select using (bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "recordings_owner_write" on storage.objects
  for insert with check (bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1]);
