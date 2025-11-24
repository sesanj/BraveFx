-- Migration: Update resources table to link to modules instead of lessons
-- Run this in Supabase SQL Editor

-- Step 1: Add new module_id column
ALTER TABLE public.resources
ADD COLUMN module_id uuid REFERENCES public.modules ON DELETE CASCADE;

-- Step 2: Migrate existing data (if any)
-- This updates resources to reference the module that their lesson belongs to
UPDATE public.resources r
SET module_id = l.module_id
FROM public.lessons l
WHERE r.lesson_id = l.id;

-- Step 3: Make module_id required (after data migration)
ALTER TABLE public.resources
ALTER COLUMN module_id SET NOT NULL;

-- Step 4: Drop the old lesson_id column
ALTER TABLE public.resources
DROP COLUMN lesson_id;

-- Step 5: Create index for better performance
CREATE INDEX idx_resources_module_id ON public.resources(module_id);

-- Verify the change
SELECT * FROM public.resources LIMIT 5;
