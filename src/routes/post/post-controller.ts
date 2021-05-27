import Post, { PostRequestForm, PublicPostFields } from "model/schema/posts";
import { Context } from "koa";
import { sendMessage } from "util/discord";

interface GetListParam {
  count: number;
  cursor: number;
}
export const getPosts = async (ctx: Context): Promise<void> => {
  const data: GetListParam = {
    count: Number(ctx.query.count),
    cursor: Number(ctx.query.cursor),
  };
  const posts = await Post.getList(data.count, data.cursor);
  console.log(posts);
  ctx.status = 200;
  ctx.body = {
    posts: posts.map((value): PublicPostFields => value.getPublicFields()),
    cursor: posts.length > 0 ? posts[posts.length - 1].number : null,
    hasNext: posts.length === data.count,
  };
};

export const writePost = async (ctx: Context): Promise<void> => {
  const body: PostRequestForm = ctx.request.body;

  const result = new Post({
    title: body.title,
    content: body.content,
    tag: body.tag,
  }).save();

  ctx.status = 201;
  ctx.set("Location", "/");
  ctx.body = { id: (await result)._id };

  const url =
    (body.tag !== "test"
      ? process.env.DISCORD_WEBHOOK
      : process.env.DISCORD_TEST_WEBHOOK) ?? "";
  await sendMessage(body, url);
};
