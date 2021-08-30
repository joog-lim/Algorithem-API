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

  // check password
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return createErrorRes({
      status: 400,
      message: "비밀번호가 잘못되었습니다.",
    });
  }

  // generate token
  const token = sign({ name: "admin" }, process.env.JWT_SECRET ?? "secure", {
    expiresIn: "3h",
  });
  return createRes({
    status: 200,
    body: { token, success: true },
  });
};
