# Vercel Deployment Guide for Recipe API

Follow this step-by-step guide to deploy your Recipe API with Vercel Postgres.

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
4.  In the "Configure Project" screen, leave everything as default.
5.  Click **"Deploy"**.
    *   *Note: The initial deployment might fail or error because the database isn't connected yet. This is normal.*

---

## Step 3: Create and Connect Database

1.  Once the project is created (even if deployment failed), go to the **Storage** tab in your project dashboard.
2.  Click **"Create Database"**.
3.  Select **"Postgres"**.
4.  Give it a name (e.g., `recipe-db`) and select a region (e.g., `Washington, D.C. - iad1` or one closer to you).
5.  Click **"Create"**.
6.  Once created, you will see a "Connect Project" section or it might auto-connect. Ensure your `recipe-api` project is connected to this database.
    *   This process automatically sets environment variables like `POSTGRES_URL`, `POSTGRES_USER`, etc., in your Vercel project.

---

## Step 4: Redeploy

1.  Go to the **Deployments** tab.
2.  Click the three dots (`...`) on your latest deployment (or the failed one) and select **"Redeploy"**.
3.  Wait for the build to finish. It should now succeed.

---

## Step 5: Initialize the Database Table

Your code has a special endpoint to create the necessary table in the database.

1.  Visit your deployed URL + `/api/init`.
    *   Example: `https://recipe-api-yourname.vercel.app/api/init`
2.  You should see a JSON response: `{"message": "Table created successfully"}`.

---

## Step 6: Verify and Test

1.  Go to your Swagger documentation at `/api-docs`.
    *   Example: `https://recipe-api-yourname.vercel.app/api-docs`
2.  Try out the API!
    *   Use **POST** to create a recipe.
    *   Use **GET** to list them.
    *   The data is now stored safely in your Vercel Postgres database.

---

## (Optional) Local Development Setup

If you want to run the project locally connected to the Vercel database:

1.  Install Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Link your local folder to the Vercel project:
    ```bash
    vercel link
    ```
3.  Pull the environment variables:
    ```bash
    vercel env pull .env.development.local
    ```
4.  Start the server:
    ```bash
    npm start
    ```
