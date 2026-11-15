# PURVITA — Healthy Snacks Ecommerce

## Project info

Customer-facing ecommerce frontend for **PURVITA Healthy Snacks**, a wholesome millet-based snack brand.

Built with React, Vite, and TypeScript, with a Supabase backend for auth/catalog/orders and Stripe for payments.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite + React + TypeScript
- React Router
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase (auth, catalog, orders, addresses)
- Stripe (payment intents, with mock payment fallback)

## How can I deploy this project?

The frontend is a Vite + React application, configured for deployment on **Vercel**.

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` includes the SPA rewrite (`/(.*) → /index.html`), so client-side routes work on refresh.

### Deploying to Vercel

1. Push this repository to GitHub.
2. Import the project into Vercel (Framework: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
3. Add the required environment variables in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` (optional, only if using Stripe)
4. Deploy.

### Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same variables in the Vercel dashboard under Project → Settings → Environment Variables.

## Can I connect a custom domain to my Vercel project?

Yes. Go to the Vercel project → **Settings → Domains** and connect your domain.

Read more here: [Vercel custom domains documentation](https://vercel.com/docs/domains).
