# Recipe API

This is a simple backend API for managing recipes, built with Express.js and configured for Vercel deployment.

## API Endpoints

- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

## Documentation

- Swagger UI: `GET /api-docs`

## Data Model

- `id`: String (UUID)
- `title`: String
- `description`: String
- `ingredients`: String
- `steps`: String
- `image_url`: String

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The API will be available at `http://localhost:3000`.

## Deployment to Vercel

1. Install Vercel CLI (optional) or use the Vercel dashboard.
2. Link your project to Vercel: `vercel link`
3. Create a Vercel Postgres database in the Vercel Dashboard -> Storage.
4. Connect the database to your project.
5. Pull the environment variables: `vercel env pull .env.development.local`
6. Run `vercel` in this directory to deploy.

## Database Initialization

After deploying or setting up locally with env vars, run the initialization endpoint ONCE to create the table:
`GET /api/init`

**Note:** This project uses **Vercel Postgres** for persistent storage.

