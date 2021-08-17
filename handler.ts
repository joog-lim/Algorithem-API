import * as mongoose from "mongoose";
import { sign } from "jsonwebtoken";

import verifierModel from "./src/model/verifieres";

const createRes = (status: number, body: Object) => {
  return {
    statusCode: status,
    body: JSON.stringify(body),
  };
};

exports.hello = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};

exports.getVerifyQuestion = async (_: any, __: any, cb: Function) => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", {
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );

  const count = await verifierModel.estimatedDocumentCount({}).exec();
  const random = Math.floor(Math.random() * count);
  const result = await verifierModel.findOne().skip(random).exec();

  if (result == null)
    return createRes(404, { error: "not found", success: false });

  const id: string = result.getId();
  const { question } = result;

  return createRes(200, { id: id, question: question });
};

interface AuthParam {
  password: string;
}
exports.authAdmin = async (event: any, _: any) => {
  const body: AuthParam = JSON.parse(event.body);
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return createRes(400, {
      error: "비밀번호가 잘못되었습니다.",
      success: false,
    });
  }

  const token = sign({ name: "admin" }, process.env.JWT_SECRET ?? "secure", {
    expiresIn: "3h",
  });
  return createRes(200, { token: token, success: true });
};
