# Getting Started with Releason

This guide will help you get up and running with the Releason project in minutes.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

From the project root, run:

```bash
npm install
```

This will install all the necessary packages including Next.js, React, NextAuth, Supabase, and more.

### 2. Configure Environment Variables

Create your local environment file:

```bash
cp .env.local.example .env.local
```

Now open `.env.local` in your editor and configure the following:

#### NextAuth Secret

Generate a secure random string:

```bash
openssl rand -base64 32
```

Copy the output and add it to `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste_your_generated_secret_here>
```

#### GitHub OAuth (Required for Authentication)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `Releason Dev` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID** and click **"Generate a new client secret"**
6. Add both to your `.env.local`:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

#### Supabase (Optional for Database)

If you want to use Supabase for your backend:

1. Go to [Supabase](https://app.supabase.com/)
2. Click **"New project"**
3. Fill in the project details and wait for it to initialize
4. Once ready, go to **Settings** → **API**
5. Copy the following values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Note**: You can skip Supabase setup initially if you only want to test authentication.

### 3. Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 4. Test the Application

1. Open your browser to `http://localhost:3000`
2. You should see the Releason home page
3. Click **"Sign in"** in the header (or navigate to `/auth/signin`)
4. Click **"Sign in with GitHub"**
5. Authorize the application
6. You'll be redirected back to the home page, now signed in!

## Common Issues

### Port 3000 already in use

If port 3000 is already in use, you can change it:

```bash
PORT=3001 npm run dev
```

Remember to update your GitHub OAuth callback URL and `NEXTAUTH_URL` accordingly.

### Environment variables not working

Make sure:
- Your `.env.local` file is in the root directory
- You've restarted the dev server after changing environment variables
- Variable names are exactly as shown (case-sensitive)

### GitHub OAuth not working

Double-check:
- Client ID and Secret are correct
- Callback URL in GitHub matches exactly: `http://localhost:3000/api/auth/callback/github`
- `NEXTAUTH_SECRET` is set

## Next Steps

Now that you have the application running:

1. Explore the codebase structure in `/src`
2. Read the [Architecture Guide](./ARCHITECTURE.md) to understand the project structure
3. Check out the [Setup Guide](./SETUP.md) for more detailed configuration options
4. Start building your features!

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Create production build
- `npm run start` - Start production server (run `build` first)
- `npm run lint` - Run ESLint to check code quality

## Getting Help

If you run into issues:
1. Check the console for error messages
2. Review the environment variables
3. Make sure all dependencies are installed
4. Try restarting the development server

Happy coding! 🚀
