-- Migration: Add answers column to quiz_attempts table
-- This will store the user's selected options for each question in the quiz

-- Add answers column as JSONB to store array of answers
ALTER TABLE public.quiz_attempts
ADD COLUMN answers JSONB DEFAULT '[]'::jsonb;

-- Add a comment to describe the column
COMMENT ON COLUMN public.quiz_attempts.answers IS 'Array of quiz answers containing questionId, selectedOptionId, and isCorrect for each question';

-- Example structure of answers JSONB:
-- [
--   {
--     "questionId": "uuid-here",
--     "selectedOptionId": "uuid-here",
--     "isCorrect": true
--   },
--   {
--     "questionId": "uuid-here",
--     "selectedOptionId": "uuid-here",
--     "isCorrect": false
--   }
-- ]
