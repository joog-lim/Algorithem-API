import Post, {
  PostRequestForm,
  PostStatus,
  PublicPostFields,
} from "model/schema/posts";
import { Context } from "koa";
import { sendMessage } from "util/discord";

interface GetListParam {
  count: number;
  cursor: number;
}

export const getPosts = async (ctx: Context): Promise<void> => {
  const data: GetListParam = {
    count: Number(ctx.query.count ?? "10"),
    cursor: Number(ctx.query.cursor ?? "0"),
  };
  const posts = await Post.getList(data.count, data.cursor);
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
    createdAt: new Date(),
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

export interface PatchPostForm {
  status?: string;
  title?: string;
  content?: string;
  FBLink?: string;
  reason?: string;
}
export const patchPost = async (ctx: Context): Promise<void> => {
  const body: PatchPostForm = ctx.request.body;
  console.log(body);
  let result;

  const post = await Post.findById(ctx.params.id);
  if (post == null) {
    ctx.status = 404;
    ctx.body = body;
    return;
  }
  if (body.status != null) {
    switch (body.status) {
      case PostStatus.Accepted:
        result = await post.setAccepted();
        break;
      case PostStatus.Rejected:
        result = await post.setRejected(body.reason ?? "내용이 부적절합니다.");
        break;
      default:
        ctx.status = 400;
    }
  } else {
    result = await post.edit(body.title, body.content, body.FBLink);
  }
  ctx.status = 200;
  ctx.body = result?.toJSON();
};
