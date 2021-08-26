import { APIGatewayEvent } from "aws-lambda";
import { verify } from "jsonwebtoken";
import { MiddlewareDTO } from "../DTO";
import { createRes } from "../util/serverless";

export function authMiddleware({
  continuous,
}: {
  continuous: boolean;
}): (
  event: APIGatewayEvent,
  next: (event: APIGatewayEvent & any) => Promise<unknown>
) => Promise<unknown> {
  return async (
    event: APIGatewayEvent,
    next: (event: APIGatewayEvent & any) => Promise<unknown>
  ): Promise<unknown> => {
    // 인증헤더가 없을 경우
    if (event.headers.authorization == null) {
      if (continuous) {
        const newEvent = Object.assign({}, event, {
          state: { isAdmin: false },
        });
        return await next(newEvent);
      } else {
        return createRes({
          status: 401,
          headers: {},
          body: { success: false, message: "인증되지 않은 유저입니다." },
        });
      }
    }

    let newEvent: MiddlewareDTO.certifiedEvent = event;
    try {
      verify(event.headers.authorization, process.env.JWT_SECRET ?? "secure");
      newEvent = Object.assign({}, event, {
        state: { isAdmin: true },
      });
    } catch (err) {
      newEvent = Object.assign({}, event, {
        state: { isAdmin: false },
      });
    }

    if (!newEvent.state.isAdmin && !continuous) {
      return createRes({
        status: 401,
        headers: {},
        body: { success: false, message: "인증되지 않은 유저입니다." },
      });
    }
    return await next(newEvent);
  };
}
