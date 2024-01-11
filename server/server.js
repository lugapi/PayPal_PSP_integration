// server.js
import express from 'express';
import "dotenv/config";
import adyenRoutes from "./routes/adyenRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import templateRoutes from './routes/templateRoutes.js';

const {
  PORT,
} = process.env;

const app = express();

app.set("view engine", "ejs");
app.set("views", "./server/views");
app.use(express.static("client"));
app.use(templateRoutes);
app.use(express.json());

app.use("/adyen/", adyenRoutes);
app.use("/stripe/", stripeRoutes);

app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}/`);
});