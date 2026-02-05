# Releason

Release Confidence Intelligence Platform

A modern Next.js 14 application built with TypeScript, Tailwind CSS, NextAuth.js, and Supabase.

## Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 🔐 **NextAuth.js** with GitHub OAuth
- 🗄️ **Supabase** for database and backend
- 📝 **TypeScript** for type safety
- 🎯 **ESLint** for code quality

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- GitHub account for OAuth
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd releason
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`. See [Setup Guide](docs/SETUP.md) for detailed instructions.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- 📚 [Getting Started Guide](docs/GETTING_STARTED.md) - Step-by-step guide for beginners
- 🔧 [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - Project architecture and design decisions
- 🔐 [Authentication Guide](docs/AUTHENTICATION.md) - Complete authentication documentation
- 📋 [Auth Implementation](docs/AUTH_IMPLEMENTATION.md) - Authentication implementation summary
- 📊 [Dashboard Guide](docs/DASHBOARD.md) - Dashboard components and features
- ⚡ [Quick Reference](docs/QUICK_REFERENCE.md) - Common patterns and code snippets
- 🗄️ [Supabase Examples](docs/SUPABASE_EXAMPLE.md) - How to use Supabase in your app

## Project Structure

```
releason/
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   ├── components/       # Reusable React components
│   └── lib/              # Utility functions and configurations
├── public/               # Static assets
├── docs/                 # Documentation
└── types/                # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.local.example` for all required environment variables.

Key variables:
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## License

See [LICENSE](LICENSE) file for details.
