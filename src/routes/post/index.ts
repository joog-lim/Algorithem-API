import * as Router from "koa-router";
import { authMiddleware } from "middleware/auth";

import { getPosts, patchPost, writePost } from "./post-controller";

const post = new Router();

post.get("/", authMiddleware(true), getPosts);
post.post("/", writePost);
post.patch("/:id", authMiddleware(false), patchPost);

export default post;
