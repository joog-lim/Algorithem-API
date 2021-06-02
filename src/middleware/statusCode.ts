import { Context } from "koa";

export async function statusCodeVerification(
  ctx: Context,
  next: Function
): Promise<void> {
  try {
    await next();
    if (ctx.status >= 400) ctx.throw(ctx.status, ctx.message);
  } catch (err) {
    if (err.status != null) {
      ctx.status = err.status;
      ctx.body = {
        error: err.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        error: "Internal Server Error",
      };
      console.error(err);
    }
  }
}
