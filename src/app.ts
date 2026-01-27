import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { userRouter } from "./modules/user/user.router";

const app = express();

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/ping", (_, res) => res.send("pong"));

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
