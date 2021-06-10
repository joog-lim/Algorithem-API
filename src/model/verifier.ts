import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Base64 } from "js-base64";
import { Schema } from "mongoose";

@modelOptions({
  schemaOptions: {
    collection: "verifier",
  },
})
class Verifier {
  public _id: Schema.Types.ObjectId;

  @prop({ required: true })
  public question: string;

  @prop({ required: true })
  public answer: string;

  public get id(): string {
    return Base64.encode(this._id.toString());
  }
}

const verifierModel = getModelForClass(Verifier);
export default verifierModel;
