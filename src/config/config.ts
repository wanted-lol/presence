import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
	port: process.env.PORT || 3000,
	botToken: process.env.BOT_TOKEN,
	guildId: process.env.GUILD_ID
}
