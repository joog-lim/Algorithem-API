import { DocumentType } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import * as mongoose from "mongoose";

import { ReturnResHTTPData } from "../../DTO/http";
import verifierModel, { Verifier } from "../../model/verifieres";
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
  const count: number = await verifierModel.estimatedDocumentCount({}).exec();
  // get random value within count
  const random: number = Math.floor(Math.random() * count);
  // get random question with random number
  const result: DocumentType<Verifier, BeAnObject> = await verifierModel
    .findOne()
    .skip(random)
    .exec();

  // return notfound error
  if (result == null)
    return createErrorRes({
      status: 404,
      message: "not found",
    });

  // get return values
  const id: string = result.getId();
  const { question } = result;

  return createRes({
    status: 200,
    body: { id, question },
  });
};
