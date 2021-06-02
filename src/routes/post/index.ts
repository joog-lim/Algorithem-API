import * as Router from "koa-router";

import { getPosts, writePost } from "./post-controller";

const post = new Router();

post.get("/", getPosts);
post.post("/", writePost);

export default post;
