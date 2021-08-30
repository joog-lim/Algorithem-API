export interface BaseHTTPData {
  headers?: Object;
  body?: Object | string;
}

export interface CreateResInput extends BaseHTTPData {
  body?: Object;
  status?: number;
}

export interface ReturnResHTTPData extends CreateResInput {
  statusCode: number;
  headers: Object;
  body: string;
}
