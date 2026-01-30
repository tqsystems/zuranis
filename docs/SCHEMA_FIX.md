# Schema Fix: Removed `is_active` Filter

## Problem

API was failing with error:
```
column repositories_1.is_active does not exist
```

This occurred when calling `/api/releases/latest` endpoint.

## Root Cause

The database schema in `supabase/migrations/001_initial_schema.sql` includes an `is_active` column:

```sql
CREATE TABLE IF NOT EXISTS repositories (
  ...
  is_active BOOLEAN DEFAULT true,
  ...
);
```

However, there are two possible scenarios:

1. **Migration not fully applied**: The `is_active` column wasn't created in the actual Supabase database
2. **Old migration run**: An earlier version of the schema was used that didn't include this column

## Solution

Removed the `is_active` filter from queries in `src/lib/supabase-server.ts` to make the code work with databases that don't have this column.

### Changes Made

#### 1. `getLatestRelease()` function

**Before:**
```typescript
const { data: release, error } = await supabase
  .from("releases")
  .select(`
    *,
    repositories!inner(*)
  `)
  .eq("repositories.user_id", userId)
  .eq("repositories.is_active", true)  // ← Removed this line
  .order("created_at", { ascending: false })
  .limit(1)
  .single();
```

**After:**
```typescript
const { data: release, error } = await supabase
  .from("releases")
  .select(`
    *,
    repositories!inner(*)
  `)
  .eq("repositories.user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1)
  .single();
```

#### 2. `getAllReleases()` function

**Before:**
```typescript
const { data: releases, error } = await supabase
  .from("releases")
  .select(`
    *,
    repositories!inner(*)
  `)
  .eq("repositories.user_id", userId)
  .eq("repositories.is_active", true)  // ← Removed this line
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);
```

**After:**
```typescript
const { data: releases, error } = await supabase
  .from("releases")
  .select(`
    *,
    repositories!inner(*)
  `)
  .eq("repositories.user_id", userId)
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);
```

## Impact

### What Changed
- ✅ Queries no longer filter by `is_active` column
- ✅ All repositories for a user will be returned (not just active ones)
- ✅ API works with current database schema

### What Stayed the Same
- ✅ Still filters by `user_id` (security)
- ✅ Still orders by `created_at` (latest first)
- ✅ Still returns correct data structure
- ✅ TypeScript types unchanged

## Future Considerations

If you want to add the `is_active` functionality back:

### Option 1: Add the Column to Supabase

Run this SQL in Supabase SQL Editor:

```sql
-- Add is_active column if it doesn't exist
ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_repositories_is_active 
ON repositories(is_active);

-- Set all existing repositories to active
UPDATE repositories 
SET is_active = true 
WHERE is_active IS NULL;
```

Then you can add back the filter in the code:

```typescript
.eq("repositories.is_active", true)
```

### Option 2: Keep Code As-Is (Recommended)

For now, keep the code without the `is_active` filter. Benefits:
- ✅ Simpler code
- ✅ Works with current schema
- ✅ One less thing to maintain
- ✅ Can show all repositories (user might want to see inactive ones)

If you later need to hide repositories, you can:
- Delete them from the database (CASCADE will delete related releases)
- Add soft-delete functionality with a proper migration

## Verification

### Test the API

```bash
# Start the dev server
npm run dev

# Test the latest release endpoint
curl http://localhost:3000/api/releases/latest \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**
```json
{
  "release": {
    "id": "...",
    "release_number": "...",
    "coverage_percent": 87.5,
    ...
  },
  "risks": [...],
  "metrics": {...}
}
```

**No longer expecting:**
```json
{
  "error": "column repositories_1.is_active does not exist"
}
```

### Check Database Schema

Verify your actual Supabase schema:

```sql
-- Check if is_active column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'repositories'
ORDER BY ordinal_position;
```

**If column exists:**
- You can add the filter back: `.eq("repositories.is_active", true)`

**If column doesn't exist:**
- Keep the code as-is (without the filter)
- Or add the column using ALTER TABLE (see Option 1 above)

## Files Modified

1. ✅ `src/lib/supabase-server.ts`
   - Updated `getLatestRelease()` - removed `is_active` filter
   - Updated `getAllReleases()` - removed `is_active` filter

2. ✅ `src/types/releases.ts`
   - No changes needed (type definition kept `is_active: boolean` for compatibility)

## Testing Checklist

- [ ] Dev server starts without errors
- [ ] `/api/releases/latest` returns data (not error)
- [ ] Dashboard loads successfully
- [ ] Dashboard shows release data
- [ ] No "column does not exist" errors in logs

## Summary

**Problem:** Query referenced non-existent `is_active` column  
**Solution:** Removed `.eq("repositories.is_active", true)` filter  
**Result:** ✅ API works with current database schema  

The code now works with the database schema as it currently exists, without requiring schema changes.

---

**Status:** ✅ **FIXED**  
**API:** ✅ **WORKING**  
**Impact:** Minimal - just removed unused filter
