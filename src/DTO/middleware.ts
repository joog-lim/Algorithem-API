import { APIGatewayEvent } from "aws-lambda";

export type certifiedEvent = APIGatewayEvent & { state?: { isAdmin: boolean } };
