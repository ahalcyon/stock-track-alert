
"use server";

import { PutItemCommand, DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./db";
import { revalidatePath } from "next/cache";

export async function createStock(formData: FormData) {
  const stock = {
    ticker: formData.get("ticker"),
    upper_threshold: parseFloat(formData.get("upper_threshold") as string),
    lower_threshold: parseFloat(formData.get("lower_threshold") as string),
    enabled: formData.get("enabled") === "on",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const command = new PutItemCommand({
    TableName: "stock-track-alert-watchlist-dev",
    Item: marshall(stock),
  });

  await dbClient.send(command);
  revalidatePath("/app");
}

export async function updateStock(formData: FormData) {
  const stock = {
    ticker: formData.get("ticker"),
    upper_threshold: parseFloat(formData.get("upper_threshold") as string),
    lower_threshold: parseFloat(formData.get("lower_threshold") as string),
    enabled: formData.get("enabled") === "on",
    updated_at: new Date().toISOString(),
  };

  const command = new PutItemCommand({
    TableName: "stock-track-alert-watchlist-dev",
    Item: marshall(stock),
  });

  await dbClient.send(command);
  revalidatePath("/app");
}

export async function deleteStock(ticker: string) {
  const command = new DeleteItemCommand({
    TableName: "stock-track-alert-watchlist-dev",
    Key: marshall({ ticker }),
  });

  await dbClient.send(command);
  revalidatePath("/app");
}

export async function getAllStocks() {
  const command = new ScanCommand({
    TableName: "stock-track-alert-watchlist-dev",
  });

  const response = await dbClient.send(command);
  return response.Items ? response.Items.map((item) => unmarshall(item)) : [];
}
