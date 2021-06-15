import { getVerifyQuestion } from "controller/verify";
import Router = require("koa-router");

const router = new Router();

router.get("/", getVerifyQuestion);

export default router;
