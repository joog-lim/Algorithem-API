import * as mongoose from "mongoose";

import verifierModel from "../../model/verifieres";
import { connectOptions } from "../../util/mongodb";
import { createRes } from "../../util/serverless";

export const getVerifyQuestion: Function = async (
  _: any,
  __: any,
  ___: Function
) => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", connectOptions)
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );

  const count = await verifierModel.estimatedDocumentCount({}).exec();
  const random = Math.floor(Math.random() * count);
  const result = await verifierModel.findOne().skip(random).exec();

  if (result == null)
    return createRes({
      status: 404,
      body: { error: "not found", success: false },
      headers: {},
    });

  const id: string = result.getId();
  const { question } = result;

  return createRes({
    status: 200,
    headers: {},
    body: { id: id, question: question },
  });
};
