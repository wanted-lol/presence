import express, { Request, Response } from 'express'
import cors from 'cors'
import { Client, Intents } from 'discord.js'
import { config } from './config/configHandler'

interface Spotify {
	track_id: string
	timestamps: {
		start: Date | null
		end: Date | null
	}
	song: string
	artist: string
	album_art_url: string
	album: string
}

interface DiscordUser {
	username: string
	flags: number | undefined
	id: string
	discriminator: string
	avatar: string
}

interface Activity {
	type: 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | 'CUSTOM' | 'COMPETING'
	timestamps?: {
		start: Date | null
		end: Date | null
	}
	state: string | null
	name: string
	id: string
	details: string | null
	created_at: number
	assets?: {
		large_text?: string
		large_image?: string
		small_text?: string
		small_image?: string
	}
	application_id?: string | null
}

interface PresenceData {
	success: boolean
	data: {
		listening_to_spotify: boolean
		spotify: Spotify | null
		discord_user: DiscordUser
		discord_status: string
		activities: Activity[]
	}
}

const app = express()
const port = config.port

app.use(cors())

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]
})

client.once('ready', () => {
	console.log(`Logged in as ${client.user?.tag}!`)
})

async function getPresence(user: string) {
	try {
		const guild = await client.guilds.fetch(config.guildId as string)
		if (!guild.members.cache.has(user)) throw new Error('Member not found')

		const member = await guild.members.fetch(user)
		if (!member || !member.presence) throw new Error('Member not found')

		const activities: Activity[] = member.presence.activities.map((activity) => {
			return {
				type: activity.type,
				timestamps: activity.timestamps as { start: Date | null; end: Date | null },
				state: activity.state,
				name: activity.name,
				id: activity.id,
				details: activity.details,
				created_at: activity.createdTimestamp,
				assets: activity.assets as {
					large_text?: string
					large_image?: string
					small_text?: string
					small_image?: string
				},
				application_id: activity.applicationId
			}
		})

		const listeningToSpotifyActivity = member.presence.activities.find(
			(activity) => activity.type === 'LISTENING' && activity.name === 'Spotify'
		)
		const spotify: Spotify | null = listeningToSpotifyActivity?.syncId
			? {
					track_id: listeningToSpotifyActivity?.syncId as string,
					timestamps: listeningToSpotifyActivity?.timestamps as {
						start: Date | null
						end: Date | null
					},
					song: listeningToSpotifyActivity?.details as string,
					artist: listeningToSpotifyActivity?.state as string,
					album_art_url: listeningToSpotifyActivity?.assets?.largeImage as string,
					album: listeningToSpotifyActivity?.assets?.largeText as string
			  }
			: null

		const presence: PresenceData = {
			success: true,
			data: {
				listening_to_spotify: spotify !== null,
				spotify: spotify,
				discord_user: {
					username: member.user.username,
					flags: member.user.flags?.bitfield,
					id: member.user.id,
					discriminator: member.user.discriminator,
					avatar: member.user.avatarURL() as string
				},
				discord_status: member.presence.status,
				activities: activities
			}
		}

		return presence
	} catch (error) {
		return {
			success: false,
			data: {
				active_on_discord_mobile: false,
				active_on_discord_desktop: false,
				listening_to_spotify: false,
				spotify: null,
				discord_user: {
					username: '',
					flags: 0,
					id: '',
					discriminator: '',
					avatar: ''
				},
				discord_status: '',
				activities: []
			}
		}
	}
}

app.get('/user/:user', async (req: Request, res: Response) => {
	const presence = await getPresence(req.params.user)

	if (!presence.success) {
		res.status(404).json(presence)
		return
	}

	res.json(presence)
})

app.use((req: Request, res: Response) => {
	res.status(404).send('Page not found')
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})

client.login(config.botToken)
