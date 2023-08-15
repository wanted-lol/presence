export interface Spotify {
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

export interface DiscordUser {
	username: string
	flags: number | undefined
	id: string
	discriminator: string
	avatar: string
}

export interface Activity {
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

export interface PresenceData {
	success: boolean
	data: {
		listening_to_spotify: boolean
		spotify: Spotify | null
		discord_user: DiscordUser
		discord_status: string
		activities: Activity[]
	}
}
