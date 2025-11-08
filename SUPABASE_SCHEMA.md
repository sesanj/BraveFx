# Supabase Database Schema for BraveFx

Run these SQL commands in your Supabase SQL Editor (Dashboard → SQL Editor)

## 1. Enable UUID Extension

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";
```

## 2. Users Table (extends Supabase auth.users)

```sql
-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies (Note: No INSERT policy needed - handled by trigger)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. Courses Table

```sql
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  instructor text not null,
  price numeric(10, 2) not null,
  currency text default 'USD',
  thumbnail text,
  duration integer, -- in seconds
  total_lessons integer default 0,
  rating numeric(3, 2) default 0,
  students_enrolled integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.courses enable row level security;

-- Policies (courses are public for browsing)
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

create policy "Only admins can insert courses"
  on public.courses for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
```

## 4. Modules Table

```sql
create table public.modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null,
  has_quiz boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.modules enable row level security;

create policy "Anyone can view modules"
  on public.modules for select
  using (true);
```

## 5. Lessons Table

```sql
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.modules on delete cascade not null,
  title text not null,
  description text,
  video_url text not null,
  duration integer not null, -- in seconds
  order_index integer not null,
  is_preview boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.lessons enable row level security;

create policy "Anyone can view lessons"
  on public.lessons for select
  using (true);
```

## 6. Resources Table

```sql
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references public.lessons on delete cascade not null,
  title text not null,
  url text not null,
  type text not null, -- 'pdf', 'excel', 'word', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resources enable row level security;

create policy "Anyone can view resources"
  on public.resources for select
  using (true);
```

## 7. Enrollments Table

```sql
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Enable RLS
alter table public.enrollments enable row level security;

create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);
```

## 8. Lesson Progress Table

```sql
create table public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade not null,
  last_position integer default 0,
  progress_percentage integer default 0,
  completed boolean default false,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Enable RLS
alter table public.lesson_progress enable row level security;

create policy "Users can view own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);
```

## 9. Course Progress Tracking Table

```sql
create table public.course_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  last_watched_lesson_id uuid references public.lessons,
  active_quiz_module_id uuid references public.modules,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Enable RLS
alter table public.course_progress enable row level security;

create policy "Users can view own course progress"
  on public.course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own course progress"
  on public.course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own course progress"
  on public.course_progress for update
  using (auth.uid() = user_id);
```

## 10. Quizzes Table

```sql
create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.modules on delete cascade not null,
  title text not null,
  description text,
  passing_score integer default 70,
  time_limit integer, -- in seconds, null = no limit
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quizzes enable row level security;

create policy "Anyone can view quizzes"
  on public.quizzes for select
  using (true);
```

## 11. Quiz Questions Table

```sql
create table public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  question text not null,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quiz_questions enable row level security;

create policy "Anyone can view quiz questions"
  on public.quiz_questions for select
  using (true);
```

## 12. Quiz Options Table

```sql
create table public.quiz_options (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.quiz_questions on delete cascade not null,
  option_text text not null,
  is_correct boolean default false,
  explanation text, -- Explanation for why this answer is correct/incorrect
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quiz_options enable row level security;

create policy "Anyone can view quiz options"
  on public.quiz_options for select
  using (true);
```

## 13. Quiz Attempts Table

```sql
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  quiz_id uuid references public.quizzes on delete cascade not null,
  module_id uuid references public.modules on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  correct_answers integer not null,
  passed boolean not null,
  attempt_number integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quiz_attempts enable row level security;

create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);
```

## 14. Create indexes for performance

```sql
-- Course indexes
create index idx_courses_created_at on public.courses(created_at);

-- Module indexes
create index idx_modules_course_id on public.modules(course_id);
create index idx_modules_order on public.modules(course_id, order_index);

-- Lesson indexes
create index idx_lessons_module_id on public.lessons(module_id);
create index idx_lessons_order on public.lessons(module_id, order_index);

-- Enrollment indexes
create index idx_enrollments_user_id on public.enrollments(user_id);
create index idx_enrollments_course_id on public.enrollments(course_id);

-- Progress indexes
create index idx_lesson_progress_user_id on public.lesson_progress(user_id);
create index idx_course_progress_user_id on public.course_progress(user_id);
create index idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
```

## 15. Create updated_at trigger function

```sql
-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply to tables with updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_courses_updated_at before update on public.courses
  for each row execute function update_updated_at_column();
```

## Next Steps

1. Run all these SQL commands in Supabase SQL Editor
2. Update your environment.ts with actual Supabase credentials
3. We'll update the Angular services to use Supabase instead of dummy data
