import { APIGatewayEvent } from "aws-lambda";
import { Base64 } from "js-base64";
import * as mongoose from "mongoose";

import { MiddlewareDTO, AlgorithemDTO } from "../../DTO";
import { authMiddleware } from "../../middleware/auth";
import Post from "../../model/posts";
import verifieres from "../../model/verifieres";
import { AlgorithemService } from "../../service";
import { connectOptions } from "../../util/mongodb";
import { createRes, createErrorRes } from "../../util/serverless";

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
    return createErrorRes({
      status: 400,
      message: "필숫값이 제대로 전달되지 않았습니다.",
    });
  }
  const certified = await verifieres
    .findOne({ _id: Base64.decode(verifier.id) })
    .exec();
  if (!certified?.isCorrect(verifier.answer)) {
    // verifier이 없거나, 있더라도 값이 올바르지않은 경우
    return createErrorRes({
      status: 401,
      message: "인증을 실패하였습니다.",
    });
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
      try {
        const { status, reason } = JSON.parse(event.body);

        if (!status) {
          return createErrorRes({
            status: 400,
            message:
              "status값이 선언되지않았습니다.\n다시 값을 확인해주시길 바랍니다.",
          });
        }
        if (!AlgorithemDTO.PostStatusArray.includes(status)) {
          return createErrorRes({
            status: 400,
            message:
              "status값이 부적절합니다.\nstatus값에 오타가 없는지 확인해주시길 바랍니다.",
          });
        }
        if (
          status == AlgorithemDTO.PostStatus.Pending ||
          status == AlgorithemDTO.PostStatus.Deleted
        ) {
          return createErrorRes({
            status: 404,
            message:
              "대기 상태나 삭제 상태로 교체할 수 없습니다.\n다른 API를 확인해주세요.",
          });
        }

        const algorithemId: string = event.pathParameters.id;

        const post = await Post.findById(algorithemId);
        if (post == null)
          return createErrorRes({
            status: 404,
            message: "알고리즘을 찾을 수 없습니다.",
          });
        const body = await AlgorithemService.AlgorithemStatusManage({
          status: status,
          algorithem: post,
          reason: reason,
        });
        return createRes({ status: 201, body: body, headers: {} });
      } catch (error) {
        if (error instanceof SyntaxError) {
          return createErrorRes({
            status: 400,
            message: "JSON 형식으로 값을 넘겨주셔야합니다.",
          });
        }
        throw error;
      }
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
      let body = {};
      try {
        body = await AlgorithemService.PatchAlgorithem(algorithemId, data);
      } catch {
        return createErrorRes({
          status: 404,
          message: "해당 게시물을 찾을 수 없습니다.",
        });
      }
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
