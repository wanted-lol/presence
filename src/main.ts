// main.ts
import express, { Request, Response } from 'express'
import cors from 'cors'
import { createDiscordClient } from './discord/discordClient'
import { config } from './config/config'
import { getPresence } from './utils/presenceUtils'

const app = express()
const port = config.port

app.use(cors())

const client = createDiscordClient()

app.get('/user/:user', async (req: Request, res: Response) => {
	const presence = await getPresence(req.params.user, client, config)

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
	console.log(`http://localhost:${port}`)
})

client.login(config.botToken)
