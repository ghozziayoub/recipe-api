# Recipe API

A RESTful API for managing recipes, built with Express.js, Prisma, and PostgreSQL. Optimized for serverless deployment on Vercel.

## Features

- ✅ Full CRUD operations for recipes
- ✅ Swagger/OpenAPI documentation
- ✅ Prisma ORM with PostgreSQL
- ✅ Prisma Accelerate support
- ✅ Serverless-optimized (Vercel-ready)
- ✅ Input validation and error handling
- ✅ Health check endpoint

## API Endpoints

### Recipes
- `GET /api/recipes` - List all recipes (ordered by newest first)
- `GET /api/recipes/:id` - Get a specific recipe by ID
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

### System
- `GET /` - API information and available endpoints
- `GET /api/health` - Health check endpoint (checks database connection)
- `GET /docs` - Swagger UI documentation

## Data Model

```typescript
{
  id: string (UUID, auto-generated)
  title: string (required)
  description: string (required)
  ingredients: string (required)
  steps: string (required)
  image_url: string (optional)
}
```

## Local Development

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database (local or remote)
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/recipe_db?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

3. **Initialize the database:**
   ```bash
   npx prisma db push
   ```
   This will create the necessary tables in your database.

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
   (This runs automatically after `npm install` via the `postinstall` script)

5. **Start the server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npm run dev
   ```

6. **Access the API:**
   - API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/docs`
   - Health Check: `http://localhost:3000/api/health`

### Useful Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Push schema changes to database
npm run db:push

# Create and apply migrations
npm run db:migrate
```

## Deployment to Vercel

### ✅ Yes, this API can be deployed on Vercel!

This project is fully configured for Vercel serverless deployment. Follow these steps:

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed

### Step 2: Set Up Database
1. **Option A: Vercel Postgres** (Recommended)
   - Go to your Vercel project dashboard
   - Navigate to Storage → Create Database → Postgres
   - Copy the connection string

2. **Option B: External PostgreSQL**
   - Use any PostgreSQL database (e.g., Supabase, Neon, Railway)
   - Get your connection string

### Step 3: Deploy to Vercel

1. **Via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset:** Other
     - **Root Directory:** ./
     - **Build Command:** `npm run postinstall && npx prisma db push`
     - **Output Directory:** (leave empty)
     - **Install Command:** `npm install`

2. **Set Environment Variables:**
   In the Vercel project settings, add:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NODE_ENV` - Set to `production`

3. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

### Step 4: Verify Deployment

1. Check your deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the health endpoint: `https://your-project.vercel.app/api/health`
3. Access Swagger docs: `https://your-project.vercel.app/docs`

### Important Notes for Vercel

- ✅ The `vercel.json` is already configured for serverless functions
- ✅ Prisma Client is optimized for serverless (connection pooling)
- ✅ Database migrations run automatically during build
- ⚠️ Make sure `DATABASE_URL` is set in Vercel environment variables
- ⚠️ For production, consider using Prisma Accelerate for better performance

## Project Structure

```
recipe-api/
├── api/
│   └── index.js          # Main API server file
├── prisma/
│   └── schema.prisma     # Prisma schema definition
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## Technologies Used

- **Express.js** - Web framework
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **Swagger/OpenAPI** - API documentation
- **CORS** - Cross-origin resource sharing

## License

ISC


