# 🔒 Profile RLS Policy Fix

## Problem

You're getting this error during checkout:

```
POST https://ppbshpbicprzorjcilcn.supabase.co/rest/v1/profiles
Profile creation error: {code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "profiles"'}
```

## Root Cause

Your `profiles` table has Row-Level Security (RLS) enabled with policies for:

- ✅ **SELECT** - Anyone can view profiles (needed for reviews)
- ✅ **UPDATE** - Users can update their own profile
- ❌ **INSERT** - **MISSING!** No policy exists to allow new profile creation

When a new user signs up during checkout, the code tries to insert a new profile record, but RLS blocks it because there's no INSERT policy.

## Why the Account Still Works

Even though the profile insert fails:

1. ✅ Auth user **is created** (in `auth.users` table)
2. ❌ Profile insert **fails** (in `public.profiles` table)
3. ✅ User gets **logged in** anyway (auth works without profile)
4. ✅ Payment and enrollment **still succeed**

However, this creates issues:

- Missing profile data (`full_name`, etc.)
- Broken foreign key relationships
- Incomplete user records

## Solution

Add an INSERT policy to the `profiles` table that allows authenticated users to create their own profile.

### Step 1: Run the SQL Migration

Open **Supabase Dashboard → SQL Editor** and run:

```sql
-- Fix profiles RLS to allow INSERT during signup/checkout
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

This policy allows a user to insert a profile record **only if** the `id` matches their authenticated user ID (`auth.uid()`).

### Step 2: Verify Policies

After running the migration, verify all policies are in place:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

You should see **3 policies**:

| Policy Name                  | Command | Using/Check Clause        |
| ---------------------------- | ------- | ------------------------- |
| Anyone can view profiles     | SELECT  | `true`                    |
| Users can update own profile | UPDATE  | `auth.uid() = id`         |
| Users can insert own profile | INSERT  | `auth.uid() = id` (CHECK) |

### Step 3: Test the Checkout

1. **Clear test data** (optional):

   ```sql
   -- Delete test users if you want to start fresh
   DELETE FROM auth.users WHERE email LIKE '%test%';
   ```

2. **Test checkout** with the test card: `4242 4242 4242 4242`

3. **Verify profile creation**:

   ```sql
   -- Check that profile was created
   SELECT id, email, full_name, created_at
   FROM profiles
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Console should be clean** - No more RLS errors!

## How RLS Policies Work

Row-Level Security (RLS) policies control who can access rows in a table:

### Policy Types:

- **SELECT** (`USING` clause) - Who can read rows?
- **INSERT** (`WITH CHECK` clause) - Who can create new rows?
- **UPDATE** (`USING` + `WITH CHECK`) - Who can modify rows?
- **DELETE** (`USING` clause) - Who can remove rows?

### Security Model for Profiles:

```sql
-- Anyone can VIEW profiles (needed for public reviews)
SELECT: USING (true)

-- Only YOU can UPDATE your profile
UPDATE: USING (auth.uid() = id)

-- Only YOU can INSERT your profile (FIXED!)
INSERT: WITH CHECK (auth.uid() = id)
```

## Alternative: Database Trigger (More Robust)

Instead of manually inserting profiles, you can use a **database trigger** that auto-creates profiles when a new auth user is created:

```sql
-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that runs after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Benefits:**

- Automatic profile creation (no manual insert needed)
- Works even if RLS blocks manual inserts
- `SECURITY DEFINER` bypasses RLS
- More reliable and maintainable

**If you use the trigger approach**, you can remove the manual profile insert from `payment.service.ts`:

```typescript
// ❌ Remove this manual insert (trigger handles it)
const { error: profileError } = await this.supabase.client.from("profiles").insert({
  id: userId,
  email: email,
  full_name: fullName,
  is_admin: false,
});
```

## Recommendation

**Use BOTH approaches** for maximum reliability:

1. ✅ Add the INSERT policy (allows manual insert)
2. ✅ Add the database trigger (auto-creates profile)
3. ✅ Keep the manual insert as backup (in case trigger fails)

This ensures profile creation always succeeds!

## Summary

- **Problem**: Missing INSERT policy on `profiles` table
- **Fix**: Add INSERT policy allowing users to create their own profile
- **SQL File**: `database-migrations/fix-profiles-insert-policy.sql`
- **Test**: Run checkout with `4242 4242 4242 4242` - should work without errors

🎉 After applying this fix, your checkout will be error-free!
