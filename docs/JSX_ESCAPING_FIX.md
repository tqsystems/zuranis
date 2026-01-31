# JSX Escaping Fix - Blog Post

**Date:** January 31, 2026  
**Issue:** Vercel deployment failed due to unescaped quotes and apostrophes in JSX content  
**Status:** ✅ FIXED

## Problem

The Next.js build was failing with ESLint errors on the blog post page (`/src/app/blog/release-confidence/page.tsx`). The React linter was flagging 50+ instances of unescaped quotes (`'` and `"`) in JSX content.

### Error Example
```
93:33  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

## Solution

Fixed all unescaped characters throughout the blog post using two approaches:

### 1. Template Literals with Curly Braces
For complex strings with multiple quotes/apostrophes:
```tsx
// Before
<span>Infrastructure changes that didn't get updated</span>

// After
<span>{`Infrastructure changes that didn't get updated`}</span>
```

### 2. HTML Entities
For simple apostrophes in headings:
```tsx
// Before
The Problem Nobody's Talking About

// After
The Problem Nobody&apos;s Talking About
```

## Fixed Content Examples

### Section Headings
- ✅ "The Problem Nobody's Talking About" → `Nobody&apos;s`
- ✅ "Why Testing Isn't Enough" → `Isn&apos;t`
- ✅ "What's Next?" → `What&apos;s`

### Body Text with Quotes
- ✅ `{`"Is the code good?"`}` and `{`"Is it safe to deploy right now?"`}`
- ✅ `{`Release confidence isn't binary. It's not "pass" or "fail."`}`
- ✅ `{`"We went from 'fingers crossed' deployments to confident releases."`}`

### List Items
- ✅ `{`Infrastructure changes that didn't get updated`}`
- ✅ `{`Third-party API changes you didn't anticipate`}`

### Dialog Examples
- ✅ `{`QA: "Tests look good"`}`
- ✅ `{`Product: "We're late. Let's go"`}`
- ✅ `{`"Go or no-go?"`}`

## Build Status

✅ **Build succeeded**
- All 50+ linting errors resolved
- Blog post now renders correctly
- Ready for Vercel deployment

## Files Modified

1. **`src/app/blog/release-confidence/page.tsx`**
   - Fixed all unescaped quotes and apostrophes
   - Maintained original content and styling
   - No functional changes, only JSX escaping

## Verification

```bash
npm run build
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Generating static pages (15/15)
```

## Key Takeaways

1. **Template literals** `{`...`}` are the cleanest way to handle complex strings with quotes
2. **HTML entities** (`&apos;`, `&quot;`) work for simple cases in plain text
3. React's `react/no-unescaped-entities` rule catches these at build time
4. Always test builds locally before pushing to Vercel

---

**Ready for Production** ✅
