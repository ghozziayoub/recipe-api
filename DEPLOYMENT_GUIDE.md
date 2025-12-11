# Vercel Deployment Guide for Recipe API

Follow this step-by-step guide to deploy your Recipe API with Prisma Postgres.

## Prerequisites

1.  **GitHub Account**: You need a GitHub account to host your code.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.
3.  **Git Installed**: Ensure you have Git installed on your machine.

---

## Step 1: Push Code to GitHub

1.  Initialize a git repository if you haven't already:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub (e.g., `recipe-api`).
3.  Link your local repository to GitHub and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/recipe-api.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Create Project on Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `recipe-api` repository you just created.
4.  **IMPORTANT:** In the "Configure Project" screen, expand **"Environment Variables"**.
5.  Add the following variable:
    *   **Name:** `PRISMA_DATABASE_URL`
    *   **Value:** `prisma+postgres://accelerate.prisma-data.net/?api_key=...` (The long string starting with `prisma+postgres://` that you got)
6.  Click **"Deploy"**.

---

## Step 3: Database Setup (Already Done!)

Since you already ran `npx prisma db push` locally, your database tables are already created! You don't need to do anything else.

---

## Step 4: Verify and Test

1.  Go to your Swagger documentation at `/api-docs`.
    *   Example: `https://recipe-api-yourname.vercel.app/api-docs`
2.  Try out the API!
    *   Use **POST** to create a recipe.
    *   Use **GET** to list them.

---

## Troubleshooting

If you see errors about "Can't reach database", ensure you added the `PRISMA_DATABASE_URL` correctly in Vercel settings.
