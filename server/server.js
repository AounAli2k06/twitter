import express from "express";
import auhtRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import connectdatabase from "./db/connect.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

app.use(cookieParser());

app.use(bodyParser.json());

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

app.use("/api/auth", auhtRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT, (k) => {
  console.log(`Server started on port ${process.env.PORT}`);
  connectdatabase();
});
