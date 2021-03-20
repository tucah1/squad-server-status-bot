require('dotenv').config()
const Discord = require('discord.js')
const bot = new Discord.Client()
const Gamedig = require('gamedig')

const TOKEN = process.env.TOKEN

const getServerInfo = (server) => {
	return new Promise(async (resolve, reject) => {
		const serverTypes = {
			mixed: {
				ip: '172.93.180.8',
				port: 9010,
			},
			occupation: {
				ip: '172.93.180.9',
				port: 9010,
			},
			invasion: {
				ip: '172.93.180.64',
				port: 27165,
			},
			laboratory: {
				ip: '172.93.180.54',
				port: 27165,
			},
			event: {
				ip: '172.93.180.6',
				port: 9010,
			},
		}

		if (server in serverTypes) {
			try {
				let result = await Gamedig.query({
					type: 'squad',
					host: serverTypes[server].ip,
					port: serverTypes[server].port,
				})
				resolve(result)
			} catch (error) {
				reject(error)
			}
		} else {
			reject('server-name')
		}
	})
}

bot.login(TOKEN)

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`)
})

bot.on('message', async (msg) => {
	if (msg.content[0] === '!') {
		let tokens = msg.content.split(' ')
		if (tokens[0] === '!server-status' && tokens.length > 1) {
			try {
				let result = await getServerInfo(tokens[1])
				let response = `${result.name}\n\n**Status:** Online\n**Map:** ${result.map}\n**Players:** ${result.players.length}/${result.maxplayers}`
				console.log(response)
				msg.channel.send(response)
			} catch (error) {
				if (error === 'server-name') {
					msg.channel.send(
						'Invalid server name! Please checkout !server-status-help command.'
					)
				} else {
					console.log(error)
					msg.channel.send('Server is offline!')
				}
			}
		} else if (tokens[0] === '!server-status-help') {
			let helpMessage =
				'To check server status please type in chat following command: !server-status [server-name]\nAvailable server names:\n- mixed\n- occupation\n- invasion\n- laboratory\n- event'
			msg.channel.send(helpMessage)
		} else if (tokens[0] === '!server-player-list' && tokens.length > 1) {
			try {
				let result = await getServerInfo(tokens[1])
				let response = `${result.name}\n\n`
				result.players.forEach((x) => {
					response += `${x.name}\n`
				})
				msg.channel.send(response)
			} catch (error) {
				if (error === 'server-name') {
					msg.channel.send(
						'Invalid server name! Please checkout !server-status-help command.'
					)
				} else {
					console.log(error)
					msg.channel.send('Server is offline!')
				}
			}
		} else {
			msg.channel.send(
				'Invalid command! Please checkout !server-status-help command.'
			)
		}
	}
})
