import { Context } from "koa";
import * as createError from "http-errors";
import { sign } from "jsonwebtoken";

export interface AuthParam {
  password: string;
}
export const authAdmin = async (ctx: Context): Promise<void> => {
  const body: AuthParam = ctx.request.body;
  if (body.password !== process.env.ADMIN_PASSWORD) {
    throw new createError.Unauthorized();
  }

  const token = sign({ name: "admin" }, process.env.JWT_SECRET ?? "secure", {
    expiresIn: "3h",
  });

  ctx.body = { token: token };
};
