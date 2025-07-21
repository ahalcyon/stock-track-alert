import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { DefaultApi } from 'finnhub-ts'
const finnhubClient = new DefaultApi({
  apiKey: Deno.env.get('FINNHUB_API_KEY'),
  isJsonMime: (input) => {
    try {
      JSON.parse(input)
      return true
    } catch (_error) { }
    return false
  },
})
import { Pushover } from 'pushover-js'
const pushover = new Pushover(Deno.env.get('PUSHOVER_USER_KEY') ?? "", Deno.env.get('PUSHOVER_API_TOKEN') ?? "")
type Target = {
  ticker: string;
  upper_threshold: number;
  lower_threshold: number;
}
const targets: Target[] = [
  { ticker: "AAPL", upper_threshold: 200, lower_threshold: 150 },
  { ticker: "MSFT", upper_threshold: 450, lower_threshold: 350 },
  { ticker: "NVDA", upper_threshold: 150, lower_threshold: 100 }];

function price(ticker: string) {
  return finnhubClient.quote(ticker).then((res) => {
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

async function check() {
  console.log(Deno.env.get('PUSHOVER_USER_KEY'));
  for (const target of targets) {
    const p = await price(target.ticker);
    if (p < target.lower_threshold) {
      await notify(`${target.ticker} が ${p.toFixed(2)} USD まで下落`);
    }
    if (p > target.upper_threshold) {
      await notify(`${target.ticker} が ${p.toFixed(2)} USD まで上昇`);
    }
  }
}

async function notify(msg: string) {
  await pushover
    .send('STOCK ALERT!!!!!', msg)
    .then(console.log)
    .catch(console.error)
}

setInterval(check, 60_000); // 1 分ごと
