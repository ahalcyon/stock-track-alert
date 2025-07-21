
import { Pushover } from 'pushover-js'
const pushover = new Pushover(Deno.env.get('PUSHOVER_USER_KEY') ?? "", Deno.env.get('PUSHOVER_API_TOKEN') ?? "")



export const handler = async (msg: string) =>  {
  await pushover
    .send('STOCK ALERT!!!!!', msg)
    .then(console.log)
    .catch(console.error)
}