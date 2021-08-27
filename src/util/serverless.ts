import { ResHTTPData } from "../DTO/http";

export const createRes = (data: ResHTTPData) => {
  const { status, headers, body } = data;
  return {
    statusCode: status ?? 200,
    headers: Object.assign(
      {},
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      headers ?? {}
    ),
    body: JSON.stringify(body ?? {}),
  };
};

export const createErrorRes = ({
  status,
  message,
}: {
  status: number;
  message: string;
}) => {
  return {
    statusCode: status ?? 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      success: false,
      message: message ?? "요청이 부적절합니다.",
    }),
  };
};
