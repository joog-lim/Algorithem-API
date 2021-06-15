import * as Router from "koa-router";
import { authAdmin } from "controller/auth";

const router = new Router();

router.post("/", authAdmin);

export default router;
