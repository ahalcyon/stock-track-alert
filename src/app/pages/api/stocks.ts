
import { NextApiRequest, NextApiResponse } from 'next';
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// 環境変数からリージョンとテーブル名を取得
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET: 銘柄一覧を取得
  if (req.method === 'GET') {
    try {
      const params = {
        TableName: TABLE_NAME,
      };
      const { Items } = await client.send(new ScanCommand(params));
      const stocks = Items ? Items.map((item) => unmarshall(item)) : [];
      return res.status(200).json(stocks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // POST: 新しい銘柄を追加
  if (req.method === 'POST') {
    try {
      const { ticker, upper_threshold, lower_threshold } = req.body;

      // バリデーション
      if (!ticker || !upper_threshold || !lower_threshold) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const now = new Date().toISOString();
      const item = {
        ticker,
        upper_threshold: Number(upper_threshold),
        lower_threshold: Number(lower_threshold),
        enabled: true, // デフォルトで有効
        created_at: now,
        updated_at: now,
      };

      const params = {
        TableName: TABLE_NAME,
        Item: marshall(item),
      };
      await client.send(new PutItemCommand(params));
      return res.status(201).json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // 対応していないHTTPメソッド
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
