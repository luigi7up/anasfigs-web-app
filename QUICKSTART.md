# 🚀 Quick Start - Ana's Fig Web App

Get your app running in 5 minutes!

## Step 1: Set Up Database (2 minutes)

1. Go to https://supabase.com and sign up
2. Create new project (choose a region, set password)
3. Go to SQL Editor → New Query
4. Paste this and click Run:

```sql
create table public.figs (
  id uuid default gen_random_uuid() primary key,
  lat float8 not null,
  lng float8 not null,
  name text not null,
  note text,
  added_by text not null,
  created_at timestamptz default now()
);

alter table public.figs enable row level security;

create policy "Anyone can view figs" on public.figs for select using (true);
create policy "Anyone can add figs" on public.figs for insert with check (true);
```

5. Go to Settings → API and copy:
   - **Project URL**
   - **anon public** key

## Step 2: Configure App (1 minute)

```bash
cd web
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key...
```

## Step 3: Run Locally (1 minute)

```bash
npm install
npm run dev
```

Open http://localhost:3000 - Done! 🎉

## Step 4: Deploy to Netlify (1 minute)

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
# Answer prompts: Create new site, build: npm run build, dir: dist

# Set environment variables
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"

# Deploy!
netlify deploy --prod
```

**Your app is now live!** 🌿

## What You Get

✅ Interactive map with rustic Mediterranean style
✅ Users enter their name (saved in browser)
✅ Add fig trees by clicking the map
✅ Real-time updates across all users
✅ Mobile-friendly responsive design
✅ Deployed globally on Netlify CDN

## Need Help?

- **Detailed Setup**: See `SETUP_INSTRUCTIONS.md`
- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Technical Details**: See `PROJECT_SUMMARY.md`

---

**That's it! Start sharing fig trees! 🌳**
