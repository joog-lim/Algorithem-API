import { Context } from "koa";
import * as Router from "koa-router";
import auth from "./auth";
import post from "./post";

const router = new Router();

router.use("/post", post.routes());
router.use("/auth", auth.routes());
router.get("/", (ctx: Context) => {
  ctx.body = "Hello bamboo";
});
export default router;
