import { APIGatewayEvent } from "aws-lambda";
import { sign } from "jsonwebtoken";
import { ReturnResHTTPData } from "../../DTO/http";

import { createErrorRes, createRes } from "../../util/serverless";

interface AuthAdmin {
  password: string;
}
exports.authAdmin = async (
  event: APIGatewayEvent,
  _: any
): Promise<ReturnResHTTPData> => {
  const body: AuthAdmin = JSON.parse(event.body);

  //get origin
  const origin: string = event.headers.origin;

  // check password
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return createErrorRes({
      message: "비밀번호가 잘못되었습니다.",
      origin,
    });
  }

  // generate token
  const token = sign({ name: "admin" }, process.env.JWT_SECRET ?? "secure", {
    expiresIn: "3h",
  });
  return createRes(
    {
      body: { token, success: true },
    },
    origin
  );
};
