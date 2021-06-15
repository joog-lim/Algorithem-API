import createHttpError = require("http-errors");
import { Context } from "koa";
import verifierModel from "model/verifieres";

export const getVerifyQuestion = async (ctx: Context): Promise<void> => {
  const count = await verifierModel.estimatedDocumentCount({}).exec();
  const random = Math.floor(Math.random() * count);
  const result = await verifierModel.findOne().skip(random).exec();

  if (result == null) throw new createHttpError.NotFound();

  ctx.body = {
    id: result.getId(),
    question: result.question,
  };
};
