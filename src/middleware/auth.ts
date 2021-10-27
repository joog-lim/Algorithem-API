import { APIGatewayEvent } from "aws-lambda";
import { verify } from "jsonwebtoken";
import { MiddlewareDTO } from "../DTO";
import { ALLOWED_ORIGINS, createErrorRes } from "../util/serverless";

export class AuthMiddleware {
  static onlyOrigin(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value;
    desc.value = function (...args: any[]) {
      const req: APIGatewayEvent = args[0];
      const origin = req.headers.origin;
      if (!ALLOWED_ORIGINS.includes(origin) && origin) {
        return createErrorRes({
          status: 401,
          message: "인증되지않은 오리진입니다.",
        });
      }
      return originMethod.apply(this, args);
    };
  }

  // add state.isAdmin for authorized user
  static admin(continuous: boolean = true) {
    return function (_: any, __: string, desc: PropertyDescriptor) {
      const originMethod = desc.value;
      desc.value = function (...args: any[]) {
        const req: APIGatewayEvent = args[0];
        if (req.headers.Authorization == null) {
          if (continuous) {
            const newReq = Object.assign({}, req, {
              state: { isAdmin: false },
            });
            return originMethod.apply(this, [newReq, args[1], args[2]]);
          } else {
            return createErrorRes({
              status: 401,
              message: "인증되지 않은 유저입니다.\n",
            });
          }
        }

        let newReq: MiddlewareDTO.CertifiedEvent = req;

        // distinguish authorized user
        try {
          verify(req.headers.Authorization, process.env.JWT_SECRET ?? "secure");
          newReq = Object.assign({}, req, {
            state: { isAdmin: true },
          });
        } catch (err) {
          newReq = Object.assign({}, req, {
            state: { isAdmin: false },
          });
        }

        if (!newReq.state.isAdmin && !continuous) {
          // return 401 HTTP error
          return createErrorRes({
            status: 401,
            message: "인증되지 않은 유저입니다.",
          });
        }

        return originMethod.apply(this, [newReq, args[1], args[2]]);
      };
    };
  }
}
