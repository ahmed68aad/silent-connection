import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { validateProductionEnv } from "./config/env.js";

const port = process.env.PORT || 3000;
validateProductionEnv();
connectDB();
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
