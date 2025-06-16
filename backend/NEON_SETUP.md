# Neon Database Setup Guide

## Step 1: Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

## Step 2: Get Connection Strings
Once your project is created:
1. Go to your project dashboard
2. Click on "Connection Details" or "Settings"
3. You'll see two connection strings:
   - **Pooled connection** (for DATABASE_URL)
   - **Direct connection** (for DIRECT_URL)

## Step 3: Update .env File
Replace the placeholder URLs in your `.env` file with your actual Neon URLs:

```env
# Your actual Neon connection strings will look like this:
DATABASE_URL="postgresql://username:password@ep-xxxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@ep-xxxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 4: Run Database Setup
After updating the URLs, run:
```bash
cd backend
npm run db:push
npm run db:seed
```

## Benefits of Neon:
- ✅ Serverless PostgreSQL
- ✅ Automatic scaling
- ✅ Built-in connection pooling
- ✅ Free tier available
- ✅ Fast cold starts
- ✅ No database management required

## Connection String Format:
- **DATABASE_URL**: Uses connection pooling (pgbouncer=true)
- **DIRECT_URL**: Direct connection for migrations and schema operations
