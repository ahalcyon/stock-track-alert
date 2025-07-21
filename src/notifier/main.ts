
import { Pushover } from 'pushover-js';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});

async function getPushoverCredentials(): Promise<{ userKey: string; apiToken: string }> {
  const userKeyCommand = new GetSecretValueCommand({ SecretId: Deno.env.get("PUSHOVER_USER_KEY") });
  const apiTokenCommand = new GetSecretValueCommand({ SecretId: Deno.env.get("PUSHOVER_API_TOKEN") });

  const [userKeyResponse, apiTokenResponse] = await Promise.all([
    secretsManager.send(userKeyCommand),
    secretsManager.send(apiTokenCommand),
  ]);

  if (userKeyResponse.SecretString && apiTokenResponse.SecretString) {
    return {
      userKey: JSON.parse(userKeyResponse.SecretString).PUSHOVER_USER_KEY,
      apiToken: JSON.parse(apiTokenResponse.SecretString).PUSHOVER_API_TOKEN,
    };
  }

  throw new Error("Unable to retrieve Pushover credentials");
}

export const handler = async (event: any) => {
  const { userKey, apiToken } = await getPushoverCredentials();
  const pushover = new Pushover(userKey, apiToken);

  for (const record of event.Records) {
    const msg = record.body;
    await pushover
      .send('STOCK ALERT!!!!!', msg)
      .then(console.log)
      .catch(console.error);
  }
};