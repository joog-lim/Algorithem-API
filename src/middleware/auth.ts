import { APIGatewayEvent } from "aws-lambda";
import { verify } from "jsonwebtoken";
import { MiddlewareDTO } from "../DTO";
import { ReturnResHTTPData } from "../DTO/http";
import { ALLOWED_ORIGINS, createErrorRes } from "../util/serverless";

// add state.isAdmin for authorized user
export function authMiddleware({
  continuous,
}: {
  continuous: boolean;
}): (
  event: APIGatewayEvent,
  next: (event: MiddlewareDTO.certifiedEvent) => Promise<ReturnResHTTPData>
) => Promise<ReturnResHTTPData> {
  return async (
    event: APIGatewayEvent,
    next: (event: MiddlewareDTO.certifiedEvent) => Promise<ReturnResHTTPData>
  ): Promise<ReturnResHTTPData> => {
    // don't have authorization header
    const origin = event.headers.origin;
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return createErrorRes({
        status: 401,
        message: "인증되지않은 오리진입니다.",
      });
    }
    if (event.headers.Authorization == null) {
      if (continuous) {
        const newEvent = Object.assign({}, event, {
          state: { isAdmin: false },
        });
        return await next(newEvent);
      } else {
        return createErrorRes({
          status: 401,
          message: "인증되지 않은 유저입니다.\n",
        });
      }
    }

    let newEvent: MiddlewareDTO.certifiedEvent = event;

    // distinguish authorized user
    try {
      verify(event.headers.Authorization, process.env.JWT_SECRET ?? "secure");
      newEvent = Object.assign({}, event, {
        state: { isAdmin: true },
      });
    } catch (err) {
      newEvent = Object.assign({}, event, {
        state: { isAdmin: false },
      });
    }

    if (!newEvent.state.isAdmin && !continuous) {
      // return 401 HTTP error
      return createErrorRes({
        status: 401,
        message: "인증되지 않은 유저입니다.",
      });
    }

    return await next(newEvent);
  };
}
