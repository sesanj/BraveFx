-- Create reviews table
-- Run this in Supabase SQL Editor

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one review per user per course
  unique(user_id, course_id)
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
-- Anyone can view reviews
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

-- Users can insert their own reviews
create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Admins can update is_featured flag
create policy "Admins can update featured status"
  on public.reviews for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Create indexes for performance
create index idx_reviews_course_id on public.reviews(course_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_rating on public.reviews(rating);
create index idx_reviews_featured on public.reviews(is_featured);
create index idx_reviews_created_at on public.reviews(created_at desc);

-- Apply updated_at trigger
create trigger update_reviews_updated_at before update on public.reviews
  for each row execute function update_updated_at_column();

-- Create a function to update course rating when reviews are added/updated/deleted
create or replace function update_course_rating()
returns trigger as $$
declare
  avg_rating numeric(3, 2);
  review_count integer;
begin
  -- Calculate average rating for the course
  select
    coalesce(avg(rating), 0)::numeric(3, 2),
    count(*)
  into avg_rating, review_count
  from public.reviews
  where course_id = coalesce(NEW.course_id, OLD.course_id);

  -- Update the course
  update public.courses
  set
    rating = avg_rating,
    updated_at = timezone('utc'::text, now())
  where id = coalesce(NEW.course_id, OLD.course_id);

  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- Create triggers to update course rating
create trigger update_course_rating_on_insert
  after insert on public.reviews
  for each row execute function update_course_rating();

create trigger update_course_rating_on_update
  after update on public.reviews
  for each row execute function update_course_rating();

create trigger update_course_rating_on_delete
  after delete on public.reviews
  for each row execute function update_course_rating();
