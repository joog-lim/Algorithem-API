import * as Router from "koa-router";
import { getPost } from "./post-controller";

const router = new Router();

router.get("/", getPost);
