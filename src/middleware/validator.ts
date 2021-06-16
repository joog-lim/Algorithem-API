import createHttpError = require("http-errors");
import { Context, Request } from "koa";

export function validatorMiddleware<T>(
  options: { where: keyof Request } = { where: "body" }
): (ctx: Context, next: () => Promise<unknown>) => Promise<void> {
  return async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
    try {
      const data = ctx.request[options.where] as T;
      ctx.state.validator = { data };
    } catch {
      throw new createHttpError.BadRequest();
    }
    await next();
  };
}
