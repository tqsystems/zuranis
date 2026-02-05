# Releason Setup Guide

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Supabase account

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

### 3. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Releason (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. After creating the app, copy the **Client ID** and generate a **Client Secret**
5. Add these to your `.env.local` file:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### 4. Set Up NextAuth Secret

Generate a secret for NextAuth:

```bash
openssl rand -base64 32
```

Add this to your `.env.local` file:
```
NEXTAUTH_SECRET=your_generated_secret
```

### 5. Set Up Supabase

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Once created, go to Project Settings > API
4. Copy the following values to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
releason/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── AuthProvider.tsx
│   └── lib/              # Utility functions and configurations
│       ├── auth.ts       # Auth helpers
│       ├── supabase.ts   # Supabase client
│       └── supabase-server.ts # Supabase server client
├── public/               # Static files
├── docs/                 # Documentation
└── ...config files
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
