import * as createError from "http-errors";
import { verify } from "jsonwebtoken";

export function authMiddleware(
  continuous: boolean
): (event: any, next: () => Promise<unknown>) => Promise<void> {
  return async (event: any, next: () => Promise<unknown>): Promise<void> => {
    // 인증헤더가 없을 경우
    if (event.request.header.authorization == null) {
      if (continuous) {
        event.state.isAdmin = false;
        await next();
        return;
      } else {
        throw new createError.Unauthorized();
      }
    }

    try {
      verify(
        event.request.header.authorization,
        process.env.JWT_SECRET ?? "secure"
      );

      event.state.isAdmin = true;
    } catch (err) {
      event.state.isAdmin = false;
    }

    if (!event.state.isAdmin && !continuous) {
      throw new createError.Unauthorized();
    }
    await next();
  };
}
export async function statusCodeVerification(
  event: any,
  next: Function
): Promise<void> {
  try {
    await next();
    if (event.status >= 400) event.throw(event.status, event.message);
  } catch (err) {
    if (err.status != null) {
      event.status = err.status;
      event.body = {
        error: err.message,
      };
    } else {
      event.status = 500;
      event.response.body = {
        error: "Internal Server Error",
      };
      console.error(err);
    }
  }
}
