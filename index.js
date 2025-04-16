import express from "express";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(clerkMiddleware());
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use("/webhooks", webhookRouter); // to prevent conflict btn express.json and body-parser
app.use(express.json());

app.get("/", (req, res) => {
  res.json({message: "Hello from blog backend api server!"})
})

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

// error handling
app.use((error, req, res, next) => {
  res.status(error.status || 500);

  res.json({
    message: error.message || "Something went wrong",
    status: error.status,
    stack: error.stack,
  });
});

app.listen(5000, () => {
  connectDB();
  console.log("Server is running!");
});
