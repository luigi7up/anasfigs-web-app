# Deployment Guide - Ana's Fig Web App

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Netlify account (free tier works)

## Part 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "New Project"
3. Sign in with GitHub (recommended) or email
4. Create a new project:
   - Name: `anasfig` (or any name you prefer)
   - Database Password: Generate a strong password (save it somewhere safe)
   - Region: Choose the closest to your target audience (e.g., `eu-west-1` for Europe)
5. Click "Create new project" and wait 2-3 minutes

### 1.2 Create Database Table

1. Once your project is ready, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create the figs table
create table public.figs (
  id uuid default gen_random_uuid() primary key,
  lat float8 not null,
  lng float8 not null,
  name text not null,
  note text,
  added_by text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.figs enable row level security;

-- Create policy: Anyone can read figs
create policy "Anyone can view figs"
  on public.figs for select
  using (true);

-- Create policy: Anyone can add figs
create policy "Anyone can add figs"
  on public.figs for insert
  with check (true);

-- Create index for faster queries
create index figs_created_at_idx on public.figs(created_at desc);
```

4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### 1.3 Get API Credentials

1. Click on the "Settings" icon (gear) in the left sidebar
2. Click "API" in the settings menu
3. Copy these values (you'll need them later):
   - **Project URL**: Should look like `https://abcdefgh.supabase.co`
   - **Project API keys > anon public**: A long string starting with `eyJ...`

✅ **Supabase setup complete!**

## Part 2: Local Testing

### 2.1 Configure Environment

1. Navigate to the web folder:
   ```bash
   cd web
   ```

2. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
   ```

### 2.2 Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### 2.3 Test the App

1. You should see a welcome modal asking for your name
2. Enter your name and click "Start Exploring"
3. Click "Add a Fig"
4. Click anywhere on the map
5. Fill in the form with:
   - Name: "Test Fig Tree"
   - Note: "This is a test entry"
6. Click "Save Fig Tree"
7. The fig should appear on the map
8. Click the fig marker to see the details

If everything works, proceed to deployment!

## Part 3: Deploy to Netlify

### Option A: Deploy with Netlify CLI (Recommended)

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser to authorize the CLI.

#### Step 3: Build the Project

```bash
# Make sure you're in the web folder
cd web

# Build for production
npm run build
```

You should see a `dist` folder created with your built files.

#### Step 4: Initialize Netlify Site

```bash
netlify init
```

Answer the prompts:
- "What would you like to do?" → **Create & configure a new site**
- "Team:" → Choose your team
- "Site name:" → `anasfig-web` (or leave blank for random name)
- "Build command:" → `npm run build`
- "Directory to deploy:" → `dist`
- "Netlify functions folder:" → (leave blank, press Enter)

#### Step 5: Set Environment Variables

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJ...your-anon-key..."
```

Replace with your actual Supabase credentials!

#### Step 6: Deploy

```bash
netlify deploy --prod
```

Wait for the build to complete. You'll get a URL like:
```
✔ Deploy complete!
  https://anasfig-web.netlify.app
```

🎉 **Your app is live!**

### Option B: Deploy via Netlify Dashboard

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
cd /Users/luka/projects/anasfig
git init

# Add web folder
git add web/
git commit -m "Add Ana's Fig web app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/anasfig.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub
5. Select your `anasfig` repository

#### Step 3: Configure Build Settings

In the deploy settings:
- **Base directory**: `web`
- **Build command**: `npm run build`
- **Publish directory**: `web/dist`

#### Step 4: Add Environment Variables

1. Click "Show advanced"
2. Click "New variable" and add:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
3. Click "New variable" again:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJ...your-anon-key...`

#### Step 5: Deploy

1. Click "Deploy site"
2. Wait 2-3 minutes for the build
3. Once complete, you'll see your site URL

🎉 **Your app is live!**

## Part 4: Post-Deployment

### Set a Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to:
   - Purchase a domain, or
   - Use an existing domain

### Monitor Your Site

- **Netlify Dashboard**: See deployment history, analytics
- **Supabase Dashboard**: Monitor database usage, see data

### Update Your App

To deploy updates:

**With CLI:**
```bash
cd web
git pull  # if using git
npm run build
netlify deploy --prod
```

**With GitHub:**
Just push to your main branch - Netlify will auto-deploy!

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Environment variable not set"**
- Double-check your environment variables in Netlify dashboard
- Make sure they start with `VITE_` (not `REACT_APP_` or `NEXT_PUBLIC_`)

### App Shows "Failed to load figs"

1. Check Supabase credentials in Netlify environment variables
2. Verify the `figs` table exists in Supabase
3. Check RLS policies are created
4. In Supabase, go to SQL Editor and run:
   ```sql
   select * from public.figs;
   ```
   If this returns an error, recreate the table

### Map Not Loading

- Check browser console (F12) for errors
- Verify Leaflet CSS is loaded (check Network tab)
- Test on different browsers

### Can't Add Figs

1. Open browser console (F12)
2. Try to add a fig
3. Look for errors
4. Common issues:
   - RLS policies not set up correctly
   - Supabase credentials incorrect
   - CORS issues (shouldn't happen with Supabase)

### Get Help

- **Supabase**: https://supabase.com/docs
- **Netlify**: https://docs.netlify.com
- **Leaflet**: https://leafletjs.com/reference.html

## Success! 🎉

Your Ana's Fig web app should now be live and accessible to anyone with the URL. Users can:

1. Enter their name (stored in browser localStorage)
2. View all fig trees on the map
3. Add new fig trees with notes
4. Click on existing figs to see details

Share the URL with friends and start mapping fig trees! 🌿
