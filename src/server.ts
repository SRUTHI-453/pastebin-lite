import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// const __dirname = path.resolve();

// Function to autoload routes
function loadRoutes() {
  const routesDir = path.join(__dirname, "routes");


    fs.readdirSync(routesDir).forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const route = require(path.join(routesDir, file));
      const routeName = "/" + file.replace(/\.(ts|js)$/, "");

      app.use(`/api${routeName}`, route.default || route);
    }
  });
}

// Load routes automatically
loadRoutes();

// UI route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/views/create.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
