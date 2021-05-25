import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as mongoose from "mongoose";

const app = new Koa();

mongoose
  .connect(process.env.MONGO_HOST ?? "", {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((): void => console.log("MongoDB connected"))
  .catch((err: Error): void => console.log("Failed to connect MongoDB: ", err));

app.proxy = true;
app.use(cors());

export default app;
