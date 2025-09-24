# Vercel Deployment Fix - DATABASE_URL Error

## Problem
Vercel deployment fails with error: `Environment variable not found: DATABASE_URL`

## Solution Steps

### 1. Set Environment Variables in Vercel Dashboard

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-key-aqui-cambiar-en-produccion
```

**Important:** Replace `[TU_PASSWORD]` with your actual Supabase database password.

### 2. Alternative: Use Vercel CLI

If you prefer using the CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add DATABASE_URL
# Paste your database URL when prompted

vercel env add NEXTAUTH_URL
# Enter: https://tu-dominio.vercel.app

vercel env add NEXTAUTH_SECRET
# Enter your secret key
```

### 3. Deploy

After setting the environment variables:

```bash
# Deploy to Vercel
vercel --prod
```

## What Was Fixed

1. **Updated `vercel.json`**: Added build environment configuration
2. **Created robust build script**: `scripts/vercel-build.js` handles missing DATABASE_URL gracefully
3. **Updated package.json**: Uses the new build script
4. **Added error handling**: Build continues even if migrations fail

## Build Process

The new build process:
1. ✅ Generates Prisma Client
2. ✅ Checks for DATABASE_URL
3. ✅ Runs migrations if DATABASE_URL is available
4. ✅ Skips migrations gracefully if DATABASE_URL is missing
5. ✅ Builds Next.js application

## Troubleshooting

### If build still fails:
1. Check that all environment variables are set in Vercel
2. Verify your DATABASE_URL is correct
3. Check Vercel build logs for specific errors

### If migrations fail:
- The build will continue and skip migrations
- You can run migrations manually after deployment
- Or set up a separate migration process

## Environment Variables Checklist

- [ ] `DATABASE_URL` - Your Supabase PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel app URL
- [ ] `NEXTAUTH_SECRET` - A secure random string
- [ ] Any other environment variables your app needs

## Next Steps

1. Set the environment variables in Vercel
2. Trigger a new deployment
3. Monitor the build logs
4. Test your deployed application
