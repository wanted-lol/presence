import { Client } from 'discord.js'
import { Activity, PresenceData, Spotify } from '../interfaces/interfaces'

export function formatActivity(activity: any): Activity {
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
}

export function formatSpotifyActivity(activity: any): Spotify | null {
	if (!activity?.syncId) {
		return null
	}

	return {
		track_id: activity.syncId,
		timestamps: activity.timestamps as { start: Date | null; end: Date | null },
		song: activity.details as string,
		artist: activity.state as string,
		album_art_url: activity.assets?.largeImage as string,
		album: activity.assets?.largeText as string
	}
}

export async function getPresence(
	user: string,
	client: Client,
	config: any
): Promise<PresenceData> {
	try {
		const guild = await client.guilds.fetch(config.guildId as string)
		if (!guild.members.cache.has(user)) {
			throw new Error('Member not found')
		}

		const member = await guild.members.fetch(user)
		if (!member || !member.presence) {
			throw new Error('Member not found')
		}

		const activities: Activity[] = member.presence.activities.map((activity: any) =>
			formatActivity(activity)
		)

		const listeningToSpotifyActivity = member.presence.activities.find(
			(activity: any) => activity.type === 'LISTENING' && activity.name === 'Spotify'
		)
		const spotify: Spotify | null = formatSpotifyActivity(listeningToSpotifyActivity)

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
		console.error(error)

		return {
			success: false,
			data: {
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
