
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});
