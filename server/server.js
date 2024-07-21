import express from "express";
import auhtRoutes from "./routes/auth.js";
import connectdatabase from "./db/connect.js";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

app.use(cookieParser ());

app.use(bodyParser.json());

app.use(express.json( ));

app.use("/api/auth", auhtRoutes);

app.listen(process.env.PORT, (k) => {
  console.log(`Server started on port ${process.env.PORT}`);
  connectdatabase();
});
