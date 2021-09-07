export interface BaseHTTPData {
  headers?: Object;
  body?: Object | string;
}

export interface CreateResInput extends BaseHTTPData {
  body?: Object;
  status?: number;
}

export interface ReturnResHTTPData extends CreateResInput {
  headers: Object;
  body: string;
}
