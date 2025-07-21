import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import "https://deno.land/x/dotenv/load.ts";
import { DefaultApi } from 'finnhub-ts';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});

async function getFinnhubApiKey(): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: Deno.env.get("FINNHUB_API_KEY") });
  const response = await secretsManager.send(command);
  if (response.SecretString) {
    return JSON.parse(response.SecretString).FINNHUB_API_KEY;
  }
  throw new Error("Unable to retrieve Finnhub API key");
}

const finnhubClient = new DefaultApi({
  apiKey: await getFinnhubApiKey(),
  isJsonMime: (input) => {
    try {
      JSON.parse(input)
      return true
    } catch (_error) { }
    return false
  },
})

type Target = {
  ticker: string;
  upper_threshold: number;
  lower_threshold: number;
}
const sqs = new SQSClient({});
const ddb = new DynamoDBClient({});

export const handler = async () => {
  const { Items = [] } = await ddb.send(new ScanCommand({ TableName: Deno.env.get("TABLE_NAME") }));

  // AttributeValue → JS オブジェクトへ変換してキャスト
  const list: Target[] = Items.map(i => unmarshall(i) as Target);
  for (const item of list) {
    const price = await fetchPrice(item.ticker);
    const message = errorMessage(price, item);
    if (message !== "") {
      await sqs.send(new SendMessageCommand({
        QueueUrl: Deno.env.get("QUEUE_URL"),
        MessageBody: message,
      }));
    }
  }
};

async function fetchPrice(ticker: string) {
  return await finnhubClient.quote(ticker).then((res) => {
    if (!res.data || res.data.c === undefined) {
      throw new Error(`No price data for ${ticker}`);
    }
    if (res.status === 429) {
      throw new Error("Rate limit exceeded!");
    }
    return res.data.c;
  }).catch((err) => {
    console.error(`Error fetching price for ${ticker}:`, err);
    throw err;
  })
}

function errorMessage(p: number, target: Target) {
  if (p < target.lower_threshold) {
    return `${target.ticker} が ${p.toFixed(2)} USD まで下落(目標値: ${target.lower_threshold})`
  }
  if (p > target.upper_threshold) {
    return `${target.ticker} が ${p.toFixed(2)} USD まで上昇(目標値: ${target.upper_threshold})`
  }
  return "";

}