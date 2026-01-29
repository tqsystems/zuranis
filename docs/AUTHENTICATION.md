# Authentication Guide

Complete guide to authentication in the Zuranis application using NextAuth.js and GitHub OAuth.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Security Best Practices](#security-best-practices)

## Overview

This application uses **NextAuth.js** for authentication with **GitHub OAuth** as the provider. The authentication system includes:

- GitHub OAuth integration with appropriate scopes
- JWT-based sessions
- Server-side and client-side authentication utilities
- Protected routes and middleware
- Custom sign-in, sign-out, and error pages
- Comprehensive error handling

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### GitHub OAuth Scopes

The application requests the following GitHub OAuth scopes:

- `read:user` - Read user profile data
- `user:email` - Access user email addresses
- `repo` - Access repository data

Modify scopes in `src/lib/auth-options.ts` if needed.

## GitHub OAuth Setup

### Step 1: Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Zuranis` (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**

### Step 2: Get Credentials

1. Copy the **Client ID**
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret**
4. Add both to your `.env.local` file

### Step 3: Production Setup

For production, create a separate OAuth App with your production URL:

- **Homepage URL**: `https://yourdomain.com`
- **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

## Usage

### Server Components

Use authentication in Server Components:

```tsx
import { getCurrentUser, requireAuth } from "@/lib/auth";

// Optional authentication
export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello {user.name}!</div>;
}

// Required authentication (redirects if not signed in)
export default async function ProtectedPage() {
  const user = await requireAuth();
  
  return <div>Welcome {user.name}!</div>;
}
```

### Client Components

Use authentication in Client Components:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { signInWithGitHub, signOutUser } from "@/lib/auth-utils";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return (
      <button onClick={() => signInWithGitHub()}>
        Sign In
      </button>
    );
  }
  
  return (
    <div>
      <p>Signed in as {session.user.name}</p>
      <button onClick={() => signOutUser()}>
        Sign Out
      </button>
    </div>
  );
}
```

### Protected Routes

#### Client-Side Protection

```tsx
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

#### Server-Side Protection

```tsx
import { requireAuth } from "@/lib/auth";

export default async function ProtectedPage() {
  await requireAuth(); // Redirects if not authenticated
  
  return <div>Protected content</div>;
}
```

#### Middleware Protection

Edit `src/middleware.ts` to protect routes:

```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
```

### API Routes

Protect API routes:

```tsx
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ data: "Protected data" });
}
```

## API Reference

### Server-Side Functions (`@/lib/auth`)

#### `getSession()`

Get the current session.

```tsx
const session = await getSession();
```

#### `getCurrentUser()`

Get the current user.

```tsx
const user = await getCurrentUser();
```

#### `getCurrentUserId()`

Get the current user's ID.

```tsx
const userId = await getCurrentUserId();
```

#### `getCurrentUserLogin()`

Get the current user's GitHub username.

```tsx
const login = await getCurrentUserLogin();
```

#### `isAuthenticated()`

Check if the user is authenticated.

```tsx
const isAuth = await isAuthenticated();
```

#### `requireAuth(callbackUrl?)`

Require authentication. Redirects if not signed in.

```tsx
const user = await requireAuth();
const user = await requireAuth("/dashboard"); // with callback
```

#### `requireSession(callbackUrl?)`

Require authentication and return the session.

```tsx
const session = await requireSession();
```

#### `hasEmail(email)`

Check if user has a specific email.

```tsx
const hasAdminEmail = await hasEmail("admin@example.com");
```

#### `hasEmailInList(emails)`

Check if user's email is in allowed list.

```tsx
const isAllowed = await hasEmailInList(["user1@example.com", "user2@example.com"]);
```

#### `hasEmailDomain(domain)`

Check if user's email domain matches.

```tsx
const isCompanyEmail = await hasEmailDomain("company.com");
```

#### `getAccessToken()`

Get the GitHub access token from session.

```tsx
const accessToken = await getAccessToken();
```

### Client-Side Functions (`@/lib/auth-utils`)

#### `signInWithGitHub(callbackUrl?)`

Sign in with GitHub.

```tsx
await signInWithGitHub();
await signInWithGitHub("/dashboard"); // with redirect
```

#### `signOutUser(callbackUrl?)`

Sign out the current user.

```tsx
await signOutUser();
await signOutUser("/"); // with redirect
```

#### `getInitials(name)`

Get initials from a name.

```tsx
const initials = getInitials("John Doe"); // "JD"
```

#### `getDisplayName(user)`

Get display name for a user.

```tsx
const name = getDisplayName(session.user);
```

#### `getSignInUrl(callbackUrl?)`

Get the sign-in URL with callback.

```tsx
const url = getSignInUrl("/dashboard");
```

#### `isValidEmail(email)`

Check if email is valid.

```tsx
const valid = isValidEmail("user@example.com");
```

#### `maskEmail(email)`

Mask email for privacy.

```tsx
const masked = maskEmail("john@example.com"); // "j***n@example.com"
```

### Components

#### `<ProtectedRoute>`

Client-side route protection component.

```tsx
<ProtectedRoute redirectTo="/auth/signin">
  <MyProtectedContent />
</ProtectedRoute>
```

#### `<UserAvatar>`

User avatar with fallback to initials.

```tsx
<UserAvatar user={session.user} size="md" />
```

## Security Best Practices

### 1. Environment Variables

- Never commit `.env.local` to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Rotate secrets regularly
- Use different secrets for development and production

### 2. OAuth Scopes

- Request only the scopes you need
- Document why each scope is required
- Review scopes periodically

### 3. Session Management

- Sessions expire after 30 days by default
- Sessions are updated every 24 hours
- Users must re-authenticate after session expires

### 4. Access Tokens

- GitHub access tokens are stored in the JWT
- Access tokens are not exposed to the client by default
- Use server-side functions to access tokens
- Consider implementing token refresh

### 5. Protected Routes

- Use middleware for route-level protection
- Use `requireAuth()` for page-level protection
- Check authentication in API routes
- Implement proper error handling

### 6. HTTPS

- Always use HTTPS in production
- Configure `NEXTAUTH_URL` with https:// in production
- Enable secure cookies in production

### 7. CSRF Protection

- NextAuth.js includes built-in CSRF protection
- Don't disable CSRF protection
- Use the CSRF token endpoint if needed

### 8. Rate Limiting

- Implement rate limiting on authentication endpoints
- Consider using Upstash or similar for distributed rate limiting
- Monitor for authentication abuse

## Troubleshooting

### Common Issues

#### "Configuration error"

- Check that all environment variables are set
- Verify `NEXTAUTH_SECRET` is set and valid
- Ensure `NEXTAUTH_URL` matches your application URL

#### "Access Denied"

- Check GitHub OAuth app settings
- Verify callback URL is correct
- Check if user's email is verified on GitHub

#### "Session not found"

- Clear browser cookies
- Check that `NEXTAUTH_SECRET` hasn't changed
- Verify session configuration in `auth-options.ts`

#### "Callback error"

- Verify GitHub OAuth credentials
- Check callback URL matches OAuth app settings
- Ensure no typos in environment variables

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
