import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes.js";

dotenv.config();

const app = express();

const origens = [
  "http://localhost:5173",
  "https://planejador-de-aulas.vercel.app/",
  "https://meu-outro-frontend.onrender.com",
];

app.use(
  cors({
    origin: origens,
  })
);
app.use(express.json());

app.use("/", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
