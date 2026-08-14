# Money Clarity

A Next.js + Supabase starter for the Money Clarity finance app.

## 1. Install

```bash
npm install
```

## 2. Add Supabase environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Do not put a Supabase secret/service-role key in these variables.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## 4. Database

The Supabase project should have the schema already installed. The database includes transactions, categories, customers, suppliers, imports, import rows, rules, RLS policies and a private receipts bucket.

## 5. Deploy

This project can be deployed to Vercel or Render. Add the same two environment variables in the hosting dashboard before deploying.

## Current working features

- Landing page
- Email/password signup
- Email/password login
- Protected dashboard
- User-specific transactions
- Income/expense entry
- Automatic revenue/expense/net calculations
- Recent transaction list
- Supabase Row Level Security foundation
