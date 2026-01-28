import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
 
dotenv.config();
 
const app = express();
app.use(express.json());
 
 
function loadRoutes() {
  const routesDir = path.join(__dirname, "routes");
 
  fs.readdirSync(routesDir).forEach((file) => {
    console.log("FOUND FILE:", file);
 
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const mod = require(path.join(routesDir, file));
      const routeName = "/" + file.replace(/\.(ts|js)$/, "");
      app.use(`/api${routeName}`, mod.default || mod);
    }
  });
}
 
 
loadRoutes();
 
// UI route for create paste
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/create.html"));
});
 
 
app.get("/p/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/view.html"));
});
 
 
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at ${process.env.BASE_URL}`);
});
 
