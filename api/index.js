const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

// Prisma Client initialization for serverless (Vercel)
// This prevents connection pool exhaustion in serverless environments
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe API',
      version: '1.0.0',
      description: 'A simple Express API for managing recipes',
    },
    servers: [
      {
        url: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000',
        description: process.env.VERCEL_URL ? 'Production server' : 'Local server',
      },
    ],
  },
  apis: ['./api/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - ingredients
 *         - steps
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the recipe
 *         title:
 *           type: string
 *           description: The title of the recipe
 *         description:
 *           type: string
 *           description: The description of the recipe
 *         ingredients:
 *           type: string
 *           description: The ingredients needed
 *         steps:
 *           type: string
 *           description: The steps to prepare the recipe
 *         image_url:
 *           type: string
 *           description: URL of the recipe image
 *       example:
 *         id: d5fE_asz
 *         title: Spaghetti Carbonara
 *         description: A classic Italian pasta dish
 *         ingredients: Spaghetti, Eggs, Pecorino Romano, Guanciale, Black Pepper
 *         steps: Boil pasta, fry guanciale, mix eggs and cheese, combine all.
 *         image_url: https://example.com/spaghetti.jpg
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Checks if the API and database are running properly
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 database:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Service unavailable (database connection issue)
 */
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: The recipes managing API
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Returns the list of all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: The list of the recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: {
        id: 'desc'
      }
    });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get the recipe by id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe id
 *     responses:
 *       200:
 *         description: The recipe description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: The recipe was not found
 */
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id }
    });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: The recipe was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Missing required fields
 */
app.post('/api/recipes', async (req, res) => {
  const { title, description, ingredients, steps, image_url } = req.body;

  if (!title || !description || !ingredients || !steps) {
    return res.status(400).json({ message: 'Missing required fields: title, description, ingredients, steps' });
  }

  // Validate input types
  if (typeof title !== 'string' || typeof description !== 'string' || 
      typeof ingredients !== 'string' || typeof steps !== 'string') {
    return res.status(400).json({ message: 'All fields must be strings' });
  }

  try {
    const newRecipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        image_url: image_url ? image_url.trim() : ''
      }
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update the recipe by the id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: The recipe was updated
 *         content:
 *           application/json:
 *             schema:
 *       404:
 *         description: The recipe was not found
 */
app.put('/api/recipes/:id', async (req, res) => {
  const { title, description, ingredients, steps, image_url } = req.body;
  const id = req.params.id;

  // Validate required fields
  if (!title || !description || !ingredients || !steps) {
    return res.status(400).json({ message: 'Missing required fields: title, description, ingredients, steps' });
  }

  try {
    // Check if recipe exists first
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        description,
        ingredients,
        steps,
        image_url: image_url || existingRecipe.image_url || ''
      }
    });

    res.json(updatedRecipe);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Remove the recipe by id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe id
 *     responses:
 *       204:
 *         description: The recipe was deleted
 *       404:
 *         description: The recipe was not found
 */
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await prisma.recipe.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Recipe API is running',
    version: '1.0.0',
    documentation: '/docs',
    health: '/api/health',
    endpoints: {
      system: {
        root: 'GET /',
        health: 'GET /api/health',
        documentation: 'GET /docs'
      },
      recipes: {
        list: 'GET /api/recipes',
        getById: 'GET /api/recipes/:id',
        create: 'POST /api/recipes',
        update: 'PUT /api/recipes/:id',
        delete: 'DELETE /api/recipes/:id'
      }
    },
    examples: {
      createRecipe: {
        method: 'POST',
        url: '/api/recipes',
        body: {
          title: 'Recipe Title',
          description: 'Recipe description',
          ingredients: 'Ingredient 1, Ingredient 2',
          steps: 'Step 1, Step 2',
          image_url: 'https://example.com/image.jpg'
        }
      },
      getRecipe: {
        method: 'GET',
        url: '/api/recipes/:id'
      }
    }
  });
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;