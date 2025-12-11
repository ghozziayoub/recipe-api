const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { sql } = require('@vercel/postgres');

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
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: '/api',
        description: 'Production server (Vercel)',
      }
    ],
  },
  apis: ['./api/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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

// In-memory data store
// In-memory data store removed, using Vercel Postgres

/**
 * @swagger
 * /api/init:
 *   get:
 *     summary: Initialize the database table (Run once)
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Table created successfully
 */
app.get('/api/init', async (req, res) => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id UUID PRIMARY KEY,
        title TEXT,
        description TEXT,
        ingredients TEXT,
        steps TEXT,
        image_url TEXT
      );
    `;
    res.status(200).json({ message: 'Table created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const { rows } = await sql`SELECT * FROM recipes`;
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const { rows } = await sql`SELECT * FROM recipes WHERE id = ${req.params.id}`;
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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

  const id = uuidv4();
  const imgUrl = image_url || '';

  try {
    await sql`
      INSERT INTO recipes (id, title, description, ingredients, steps, image_url)
      VALUES (${id}, ${title}, ${description}, ${ingredients}, ${steps}, ${imgUrl})
    `;

    const newRecipe = {
      id,
      title,
      description,
      ingredients,
      steps,
      image_url: imgUrl
    };

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: The recipe was not found
 */
app.put('/api/recipes/:id', async (req, res) => {
  const { title, description, ingredients, steps, image_url } = req.body;
  const id = req.params.id;

  try {
    // First check if recipe exists
    const check = await sql`SELECT * FROM recipes WHERE id = ${id}`;
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const current = check.rows[0];
    const newTitle = title || current.title;
    const newDesc = description || current.description;
    const newIng = ingredients || current.ingredients;
    const newSteps = steps || current.steps;
    const newImg = image_url || current.image_url;

    await sql`
      UPDATE recipes 
      SET title = ${newTitle}, description = ${newDesc}, ingredients = ${newIng}, steps = ${newSteps}, image_url = ${newImg}
      WHERE id = ${id}
    `;

    res.json({
      id,
      title: newTitle,
      description: newDesc,
      ingredients: newIng,
      steps: newSteps,
      image_url: newImg
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const result = await sql`DELETE FROM recipes WHERE id = ${req.params.id}`;
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Recipe API is running. Documentation available at /api-docs');
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
