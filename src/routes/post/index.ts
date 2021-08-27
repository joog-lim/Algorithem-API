import { APIGatewayEvent } from "aws-lambda";
import { Base64 } from "js-base64";
import * as mongoose from "mongoose";

import { MiddlewareDTO, AlgorithemDTO } from "../../DTO";
import { authMiddleware } from "../../middleware/auth";
import Post from "../../model/posts";
import verifieres from "../../model/verifieres";
import { AlgorithemService } from "../../service";
import { connectOptions } from "../../util/mongodb";
import { createRes } from "../../util/serverless";

export const getAlgorithemCountAtAll: Function = async (
  _: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", connectOptions)
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );

  const body = await AlgorithemService.GetKindOfAlgorithemCount();
  return createRes({ status: 200, body: body });
};

export const getAlgorithemList: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: true })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      mongoose
        .connect(process.env.MONGO_URL ?? "", connectOptions)
        .then((): void => console.log("MongoDB connected"))
        .catch((err: Error): void =>
          console.log("Failed to connect MongoDB: ", err)
        );

      const { count, cursor, status } = event.queryStringParameters;
      const data = await AlgorithemService.GetAlgorithemList(
        {
          count: Number(count ?? "10"),
          cursor: cursor ?? "0",
          status: status ?? AlgorithemDTO.PostStatus.Accepted,
        },
        event.state.isAdmin
      );
      return createRes({ status: 200, headers: {}, body: data });
    }
  );
};

export const wirteAlogorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", connectOptions)
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );
  const { title, content, tag, verifier } = JSON.parse(event.body);
  if (!title || !content || !tag) {
    return createRes({
      status: 400,
      body: { success: false, message: "필숫값이 제대로 전달되지 않았습니다." },
    });
  }
  const certified = await verifieres
    .findOne({ _id: Base64.decode(verifier.id) })
    .exec();
  if (!certified?.isCorrect(verifier.answer)) {
    // verifier이 없거나, 있더라도 값이 올바르지않은 경우
    return createRes({
      status: 401,
      body: {
        success: false,
        message: "인증을 실패하였습니다.",
      },
      headers: {},
    }); // HTTP 401
  }
  const body = await AlgorithemService.PostAlgorithem({
    title: title,
    content: content,
    tag: tag,
  });
  return createRes({ status: 200, body: body, headers: {} });
};

export const setAlogorithemStatus: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: false })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      mongoose
        .connect(process.env.MONGO_URL ?? "", connectOptions)
        .then((): void => console.log("MongoDB connected"))
        .catch((err: Error): void =>
          console.log("Failed to connect MongoDB: ", err)
        );
      const { status, reason } = JSON.parse(event.body);
      if (!status) {
        return createRes({
          status: 400,
          body: {
            success: false,
            message:
              "status값이 선언되지않았습니다.\n다시 값을 확인해주시길 바랍니다.",
          },
        });
      }
      if (
        status == AlgorithemDTO.PostStatus.Pending ||
        status == AlgorithemDTO.PostStatus.Deleted
      ) {
        return createRes({
          status: 404,
          body: {
            success: false,
            message:
              "대기 상태나 삭제 상태로 교체할 수 없습니다.\n다른 API를 확인해주세요.",
          },
        });
      }
      const algorithemId: string = event.pathParameters.id;

      const post = await Post.findById(algorithemId);
      if (post == null)
        return createRes({
          status: 404,
          body: { success: false, message: "알고리즘을 찾을 수 없습니다." },
        });
      const body = await AlgorithemService.AlgorithemStatusManage({
        status: status,
        algorithem: post,
        reason: reason,
      });
      return createRes({ status: 201, body: body, headers: {} });
    }
  );
};
export const modifyAlogirithemContent: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: false })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      mongoose
        .connect(process.env.MONGO_URL ?? "", connectOptions)
        .then((): void => console.log("MongoDB connected"))
        .catch((err: Error): void =>
          console.log("Failed to connect MongoDB: ", err)
        );
      const algorithemId: string = event.pathParameters.id;
      const data: AlgorithemDTO.OptionalBasePostForm = JSON.parse(event.body);

      const body = await AlgorithemService.PatchAlgorithem(algorithemId, data);
      return createRes({ status: 200, body: body, headers: {} });
    }
  );
};

export const reportAlogorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  mongoose
    .connect(process.env.MONGO_URL ?? "", connectOptions)
    .then((): void => console.log("MongoDB connected"))
    .catch((err: Error): void =>
      console.log("Failed to connect MongoDB: ", err)
    );
  const data: { reason: string } = JSON.parse(event.body);
  const id = event.pathParameters.id;
  const body = await AlgorithemService.SetDeleteStatus(id, data.reason);
  return createRes({ status: 200, body: body, headers: {} });
};

export const deleteAlgorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: false })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      mongoose
        .connect(process.env.MONGO_URL ?? "", connectOptions)
        .then((): void => console.log("MongoDB connected"))
        .catch((err: Error): void =>
          console.log("Failed to connect MongoDB: ", err)
        );
      const algorithemId: string = event.pathParameters.id;
      const data: { reason: string } = JSON.parse(event.body);

      const body = await AlgorithemService.DeleteAlgorithem(
        algorithemId,
        data.reason ?? "규칙에 위반된 알고리즘이기에 삭제되었습니다."
      );
      return createRes({ status: 200, body: body, headers: {} });
    }
  );
};
