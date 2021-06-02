import * as Router from "koa-router";

import { getPosts, patchPost, writePost } from "./post-controller";

const post = new Router();

post.get("/", getPosts);
post.post("/", writePost);
post.patch("/:id", patchPost);

export default post;
