import * as mongoose from "mongoose";

import { ReturnResHTTPData } from "../../DTO/http";
import verifierModel from "../../model/verifieres";
import { connectOptions } from "../../util/mongodb";
import { createRes, createErrorRes } from "../../util/serverless";

// send verify question
export const getVerifyQuestion: Function = async (
  _: any,
  __: any,
  ___: Function
): Promise<ReturnResHTTPData> => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", connectOptions)
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );

  // count verify question
  const count = await verifierModel.estimatedDocumentCount({}).exec();
  // get random value within count
  const random = Math.floor(Math.random() * count);
  // get random question with random number
  const result = await verifierModel.findOne().skip(random).exec();

  // return notfound error
  if (result == null)
    return createErrorRes({
      status: 404,
      message: "not found",
    });

  const id: string = result.getId();
  const { question } = result;

  return createRes({
    status: 200,
    body: { id: id, question: question },
  });
};
