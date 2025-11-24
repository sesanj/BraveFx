# Quiz System - Database Structure

This document outlines the database tables needed for the quiz system integration with Supabase.

## Database Tables

### 1. `module_quizzes`

Stores quiz information for each module.

```sql
CREATE TABLE module_quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `quiz_questions`

Stores individual questions for each quiz.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, order_number)
);
```

### 3. `quiz_options`

Stores answer options for each question.

```sql
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL,
  UNIQUE(question_id, order_number)
);
```

### 4. `user_quiz_attempts`

Stores user quiz attempt results.

```sql
CREATE TABLE user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id),
  module_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, attempt_number)
);
```

## JSONB Structure for `answers` field

```json
[
  {
    "questionId": "uuid",
    "selectedOptionId": "uuid",
    "isCorrect": true
  }
]
```

## Indexes

```sql
-- For faster lookups
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_quiz_id ON user_quiz_attempts(quiz_id);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes, questions, and options are readable by authenticated users
CREATE POLICY "Authenticated users can read quizzes"
  ON module_quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read options"
  ON quiz_options FOR SELECT
  TO authenticated
  USING (true);

-- Users can only read their own attempts
CREATE POLICY "Users can read own attempts"
  ON user_quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON user_quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Implementation Status

- ✅ Data models created (`quiz.model.ts`)
- ✅ Quiz service with mock data created (`quiz.service.ts`)
- ✅ Quiz player component created
- ✅ Integration with course player complete
- ⏳ Supabase integration (to be implemented)

## Next Steps

1. Create the tables in Supabase
2. Add sample quiz data for Module 1
3. Update `QuizService` to use Supabase instead of mock data
4. Test quiz flow end-to-end
5. Add quiz indicator in lesson sidebar
6. Update progress tracking to include quiz completion

## Usage

When a student completes the last lesson in a module that has `hasQuiz: true`, the quiz automatically appears. The student must complete the quiz to proceed to the next module. Quiz results are tracked with attempt numbers allowing unlimited retries.
