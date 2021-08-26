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
