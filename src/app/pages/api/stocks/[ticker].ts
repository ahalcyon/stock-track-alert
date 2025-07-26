import { NextApiRequest, NextApiResponse } from 'next';
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ticker } = req.query;

  if (typeof ticker !== 'string') {
    return res.status(400).json({ message: 'Invalid ticker' });
  }

  // PUT: 銘柄情報を更新 (enabledフラグの切り替えも含む)
  if (req.method === 'PUT') {
    try {
      const { upper_threshold, lower_threshold, enabled } = req.body;

      // 更新対象の項目を動的に構築
      let updateExpression = 'set';
      const expressionAttributeValues: any = {};
      const expressionAttributeNames: any = {};

      if (upper_threshold !== undefined) {
        updateExpression += ' #upper = :upper,';
        expressionAttributeNames['#upper'] = 'upper_threshold';
        expressionAttributeValues[':upper'] = Number(upper_threshold);
      }
      if (lower_threshold !== undefined) {
        updateExpression += ' #lower = :lower,';
        expressionAttributeNames['#lower'] = 'lower_threshold';
        expressionAttributeValues[':lower'] = Number(lower_threshold);
      }
      if (enabled !== undefined) {
        updateExpression += ' #enabled = :enabled,';
        expressionAttributeNames['#enabled'] = 'enabled';
        expressionAttributeValues[':enabled'] = Boolean(enabled);
      }

      updateExpression += ' #updated = :updated';
      expressionAttributeNames['#updated'] = 'updated_at';
      expressionAttributeValues[':updated'] = new Date().toISOString();

      const params = {
        TableName: TABLE_NAME,
        Key: marshall({ ticker }),
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        ReturnValues: 'ALL_NEW', // 更新後の項目を返す
      };

      const { Attributes } = await client.send(new UpdateItemCommand(params));
      return res.status(200).json(Attributes ? unmarshall(Attributes) : null);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // DELETE: 銘柄を削除
  if (req.method === 'DELETE') {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: marshall({ ticker }),
      };
      await client.send(new DeleteItemCommand(params));
      return res.status(204).end(); // No Content
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}