# Deployment Instructions

This repository has been configured to deploy seamlessly to Vercel as a Monorepo (Frontend + Serverless Backend).

## Prerequisites
1.  **Vercel Account**: Linked to your GitHub.
2.  **Supabase Project**: With database URL and keys.
3.  **Coinbase Wallet Project ID**: For the frontend.

## Deployment Steps

1.  **Push to GitHub**:
    Push this entire repository to your new GitHub repository.

2.  **Import to Vercel**:
    - Go to Vercel Dashboard -> Add New -> Project.
    - Import your GitHub repository.

3.  **Configure Project Settings**:
    - **Framework Preset**: Vercel should auto-detect "Vite". If not, select **Vite**.
    - **Root Directory**: `./` (default).
    - **Build Command**: `vite build` (default).
    - **Output Directory**: `dist` (default).
    - **Install Command**: `npm install` (default).

4.  **Environment Variables**:
    Add the following variables in the Vercel Project Settings:

    **Backend (Required):**
    - `SUPABASE_URL`: Your Supabase URL.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for backend admin access).
    - `SUPABASE_KEY`: Your Supabase Anon Key (fallback).
    - `API_TOKEN`: A secret token for internal API security (optional but recommended).

    **Frontend (Required):**
    - `VITE_SUPABASE_URL`: Same as `SUPABASE_URL`.
    - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    - `VITE_API_BASE`: Leave empty or set to `/api` (Vercel automatically routes `/api` to functions).
    - `VITE_WALLET_PROJECT_ID`: Your Coinbase Wallet Project ID.

5.  **Deploy**:
    Click **Deploy**.

## Troubleshooting
- **500 Errors**: Check the "Functions" tab in Vercel for logs.
- **Database Issues**: Ensure your Supabase project has the correct schema applied. You can run migrations locally using `npm run migrate:up` (requires configuring `migrate-mongo-config.cjs` or manually applying SQL).

## Local Development
- Run `npm install`.
- Run `npm run dev` to start the frontend.
- Run `npm run dev` inside `server/` to start the backend locally (if needed for standalone testing), OR use `vercel dev` to simulate the full stack.
