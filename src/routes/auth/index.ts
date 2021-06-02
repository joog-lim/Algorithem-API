import * as Router from "koa-router";
import { authAdmin } from "./auth-controller";

const router = new Router();

router.post("/", authAdmin);

export default router;
