# Quiz Review Feature - Database Fix

## Problem Identified ✅

You were absolutely correct! The issue was that **we weren't storing the user's selected options in the database**.

### Root Cause:

- The `quiz_attempts` table didn't have an `answers` column
- When saving quiz attempts, we were passing an empty array: `answers: []`
- The quiz review modal couldn't show which options the user selected because that data was never stored

## Solution Implemented

### 1. Database Migration ✅

**File:** `database-migrations/add-answers-to-quiz-attempts.sql`

Added a JSONB column to store the user's answers:

```sql
ALTER TABLE public.quiz_attempts
ADD COLUMN answers JSONB DEFAULT '[]'::jsonb;
```

**Structure of answers:**

```json
[
  {
    "questionId": "uuid-here",
    "selectedOptionId": "uuid-here",
    "isCorrect": true
  },
  {
    "questionId": "uuid-here",
    "selectedOptionId": "uuid-here",
    "isCorrect": false
  }
]
```

### 2. Code Updates ✅

#### A. Updated QuizResult Interface

**File:** `src/app/core/models/quiz.model.ts`

```typescript
export interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptNumber: number;
  answers: QuizAnswer[]; // ✅ Added this
}
```

#### B. Updated Quiz Player Component

**File:** `src/app/features/course-player/components/quiz-player/quiz-player.component.ts`

The `calculateScore()` method now includes answers in the returned result:

```typescript
return {
  score,
  passed,
  correctAnswers: correctCount,
  totalQuestions: this.quiz.questions.length,
  attemptNumber: this.attemptNumber,
  answers, // ✅ Added this
};
```

#### C. Updated Course Player Component

**File:** `src/app/features/course-player/course-player.component.ts`

Now uses the answers from the quiz result:

```typescript
const attempt: QuizAttempt = {
  // ... other fields
  answers: result.answers, // ✅ Changed from []
  completedAt: new Date().toISOString(),
};
```

#### D. Updated Quiz Service

**File:** `src/app/core/services/quiz.service.ts`

1. **saveQuizAttempt()** - Now includes answers when saving:

```typescript
const attemptData = {
  // ... other fields
  answers: attempt.answers, // ✅ Added this
};
```

2. **getPassedQuizResult()** - Now returns answers:

```typescript
return {
  score: data.score,
  passed: data.passed,
  correctAnswers: data.correct_answers,
  totalQuestions: data.total_questions,
  attemptNumber: data.attempt_number,
  answers: data.answers || [], // ✅ Added this
};
```

3. **getQuizAttemptById()** - Already had this implemented ✅

## Next Steps

### 1. Run the Database Migration 🔧

Go to your Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE public.quiz_attempts
ADD COLUMN answers JSONB DEFAULT '[]'::jsonb;
```

### 2. Test the Feature 🧪

1. Take a quiz (answer some questions correctly and some incorrectly)
2. Go to the Progress tab
3. Click on the quiz to see the review
4. You should now see:
   - ✅ Green badges on questions you answered correctly
   - ❌ Red "Your answer" labels on options you selected incorrectly
   - ✅ Green "Correct answer" labels on the actual correct answers (when you were wrong)

## What This Fixes

Before:

- ❌ All questions showed "Incorrect" badge
- ❌ Only correct answers were highlighted (not the user's selections)
- ❌ No way to see what the user actually selected

After:

- ✅ Questions show correct/incorrect badges based on user's answer
- ✅ User's selected options are highlighted (green if correct, red if wrong)
- ✅ Correct answers are shown when user selected wrong option
- ✅ Clear visual distinction with labels ("Your answer" / "Correct answer")

## Summary

The issue was a **data persistence problem**, not a UI bug. Now that we're storing the user's selected options in the database, the quiz review modal will have all the information it needs to:

- Show which options the user selected
- Highlight correct vs incorrect selections
- Display the correct answer when the user was wrong
- Show accurate question-level badges (correct/incorrect)

Perfect diagnosis! 🎯
