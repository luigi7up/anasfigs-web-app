# Setup Instructions for Ana's Fig Web App

## Quick Start Guide

### Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in the details:
   - Project name: `anasfig`
   - Database password: (choose a strong password)
   - Region: Choose closest to your users
3. Wait for the project to be created (~2 minutes)

### Step 2: Create Database Table

1. In your Supabase project, go to the SQL Editor (left sidebar)
2. Click "New Query"
3. Paste this SQL and click "Run":

```sql
-- Create the figs table
create table figs (
  id uuid default gen_random_uuid() primary key,
  lat float8 not null,
  lng float8 not null,
  name text not null,
  note text,
  added_by text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table figs enable row level security;

-- Allow everyone to read figs
create policy "Anyone can view figs"
  on figs for select
  using (true);

-- Allow everyone to add figs
create policy "Anyone can add figs"
  on figs for insert
  with check (true);
```

### Step 3: Get Your Supabase Credentials

1. Go to Project Settings (gear icon in left sidebar)
2. Click on "API" section
3. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Configure the Web App

1. In the `web` folder, create a `.env` file:
   ```bash
   cd web
   cp .env.example .env
   ```

2. Edit `.env` and paste your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

### Step 5: Run Locally

```bash
# Make sure you're in the web folder
cd web

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Open your browser to `http://localhost:3000`

### Step 6: Deploy to Netlify

#### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize the site (first time only)
netlify init

# Deploy to production
netlify deploy --prod
```

When prompted:
- Build command: `npm run build`
- Publish directory: `dist`

Then add your environment variables:
```bash
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-public-key"
```

#### Option B: Using Netlify Dashboard

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `web`
6. Click "Show advanced" → "Add environment variable"
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your anon key
7. Click "Deploy site"

Your site will be live in a few minutes!

## Testing the App

1. Open the deployed URL
2. Enter your name when prompted
3. Click "Add a Fig"
4. Click on the map to place a pin
5. Fill in the fig tree details
6. Save and see it appear on the map!

## Troubleshooting

### "Failed to load figs"
- Check that your Supabase credentials are correct in `.env`
- Verify the `figs` table exists in Supabase
- Check that RLS policies are set up correctly

### Map not showing
- Check browser console for errors
- Make sure you have internet connection (map tiles load from internet)

### Can't add figs
- Verify you've set up the RLS policies in Supabase
- Check that the `added_by` field is being sent correctly

### Build fails on Netlify
- Make sure environment variables are set in Netlify dashboard
- Check that `netlify.toml` is in the `web` folder
- Verify build command is `npm run build` with publish directory `dist`

## Optional Enhancements

### Add a Custom Domain
1. In Netlify dashboard, go to Domain Settings
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### Enable Analytics
1. In Netlify dashboard, go to Analytics
2. Enable analytics to track visitors

### Add More Features
- Photo uploads for fig trees
- User profiles
- Comments on fig trees
- Search and filter functionality

## Support

For issues with:
- **Supabase**: Check [supabase.com/docs](https://supabase.com/docs)
- **Netlify**: Check [docs.netlify.com](https://docs.netlify.com)
- **Leaflet**: Check [leafletjs.com](https://leafletjs.com)
