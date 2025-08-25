import express from "express";
import { config } from "dotenv";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cors from "cors";
import { dbConnection } from "./database/dbConnection.js";
import cookieParser from "cookie-parser";
import userRouter from "./router/userRouter.js";
import plantRouter from "./router/plantRouter.js";
import cartRouter from "./router/cartRouter.js";
import orderRouter from "./router/orderRouter.js";
const app = express();

config({ path: "./config/config.env" });

app.use(cors({
  origin: [process.env.FRONTEND_URI], // Ensure these URIs are correct
  methods: ["GET", "POST", "PUT", "DELETE"], // Ensure methods are correct
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/plant",plantRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders",orderRouter);
dbConnection();
app.use(errorMiddleware);


export default app;
