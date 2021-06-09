import * as createError from "http-errors";
import { verify } from "jsonwebtoken";
import { Context } from "koa";

export function authMiddleware(
  continuous: boolean
): (ctx: Context, next: () => Promise<unknown>) => Promise<void> {
  return async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
    // 인증헤더가 없을 경우
    if (ctx.header.authorization == null) {
      if (continuous) {
        ctx.state.isAdmin = false;
        await next();
        return;
      } else {
        throw new createError.Unauthorized();
      }
    }

    try {
      verify(ctx.header.authorization, process.env.JWT_SECRET ?? "secure");

      ctx.state.isAdmin = true;
    } catch (err) {
      ctx.state.isAdmin = false;
    }

    if (!ctx.state.isAdmin && !continuous) {
      throw new createError.Unauthorized();
    }
    await next();
  };
}
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
