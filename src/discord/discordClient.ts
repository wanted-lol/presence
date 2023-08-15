// discordClient.ts
import { Client, Intents } from 'discord.js';

export function createDiscordClient(): Client {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]
  });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  return client;
}
