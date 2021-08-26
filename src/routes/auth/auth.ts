import { APIGatewayEvent } from "aws-lambda";
import { sign } from "jsonwebtoken";

import { createRes } from "../../util/serverless";

interface AuthAdmin {
  password: string;
}
exports.authAdmin = async (event: APIGatewayEvent, _: any) => {
  const body: AuthAdmin = JSON.parse(event.body);
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return createRes({
      status: 400,
      body: {
        error: "비밀번호가 잘못되었습니다.",
        success: false,
      },
      headers: {},
    });
  }

  const token = sign({ name: "admin" }, process.env.JWT_SECRET ?? "secure", {
    expiresIn: "3h",
  });
  return createRes({
    status: 200,
    body: { token: token, success: true },
    headers: {},
  });
};
