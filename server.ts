import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("pontual.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hourly_rate REAL DEFAULT 20.0
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_paid REAL NOT NULL,
    total_length REAL NOT NULL,
    total_weight REAL NOT NULL,
    cost_per_meter REAL GENERATED ALWAYS AS (price_paid / total_length) VIRTUAL
  );

  CREATE TABLE IF NOT EXISTS point_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    abbreviation TEXT,
    sample_time_10 REAL NOT NULL,
    unit_time REAL GENERATED ALWAYS AS (sample_time_10 / 10.0) VIRTUAL
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    profit_margin REAL NOT NULL,
    suggested_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recipe_materials (
    recipe_id INTEGER,
    material_id INTEGER,
    length_used REAL NOT NULL,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(material_id) REFERENCES materials(id)
  );

  CREATE TABLE IF NOT EXISTS recipe_points (
    recipe_id INTEGER,
    point_type_id INTEGER,
    quantity INTEGER NOT NULL,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(point_type_id) REFERENCES point_types(id)
  );

  INSERT OR IGNORE INTO settings (id, hourly_rate) VALUES (1, 20.0);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const { hourly_rate } = req.body;
    db.prepare("UPDATE settings SET hourly_rate = ? WHERE id = 1").run(hourly_rate);
    res.json({ success: true });
  });

  // Materials
  app.get("/api/materials", (req, res) => {
    const materials = db.prepare("SELECT * FROM materials").all();
    res.json(materials);
  });

  app.post("/api/materials", (req, res) => {
    const { name, price_paid, total_length, total_weight } = req.body;
    const result = db.prepare("INSERT INTO materials (name, price_paid, total_length, total_weight) VALUES (?, ?, ?, ?)").run(name, price_paid, total_length, total_weight);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/materials/:id", (req, res) => {
    db.prepare("DELETE FROM materials WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Point Types
  app.get("/api/points", (req, res) => {
    const points = db.prepare("SELECT * FROM point_types").all();
    res.json(points);
  });

  app.post("/api/points", (req, res) => {
    const { name, abbreviation, sample_time_10 } = req.body;
    const result = db.prepare("INSERT INTO point_types (name, abbreviation, sample_time_10) VALUES (?, ?, ?)").run(name, abbreviation, sample_time_10);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/points/:id", (req, res) => {
    db.prepare("DELETE FROM point_types WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Recipes
  app.get("/api/recipes", (req, res) => {
    const recipes = db.prepare("SELECT * FROM recipes ORDER BY created_at DESC").all();
    const fullRecipes = recipes.map(recipe => {
      const materials = db.prepare(`
        SELECT rm.*, m.name, m.cost_per_meter 
        FROM recipe_materials rm 
        JOIN materials m ON rm.material_id = m.id 
        WHERE rm.recipe_id = ?
      `).all(recipe.id);
      
      const points = db.prepare(`
        SELECT rp.*, pt.name, pt.unit_time 
        FROM recipe_points rp 
        JOIN point_types pt ON rp.point_type_id = pt.id 
        WHERE rp.recipe_id = ?
      `).all(recipe.id);

      return { ...recipe, materials, points };
    });
    res.json(fullRecipes);
  });

  app.post("/api/recipes", (req, res) => {
    const { name, category, profit_margin, suggested_price, materials, points } = req.body;
    
    const transaction = db.transaction(() => {
      const result = db.prepare("INSERT INTO recipes (name, category, profit_margin, suggested_price) VALUES (?, ?, ?, ?)").run(name, category, profit_margin, suggested_price);
      const recipeId = result.lastInsertRowid;

      for (const m of materials) {
        db.prepare("INSERT INTO recipe_materials (recipe_id, material_id, length_used) VALUES (?, ?, ?)").run(recipeId, m.material_id, m.length_used);
      }

      for (const p of points) {
        db.prepare("INSERT INTO recipe_points (recipe_id, point_type_id, quantity) VALUES (?, ?, ?)").run(recipeId, p.point_type_id, p.quantity);
      }

      return recipeId;
    });

    const id = transaction();
    res.json({ id });
  });

  app.delete("/api/recipes/:id", (req, res) => {
    db.prepare("DELETE FROM recipes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
