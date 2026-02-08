const mineflayer = require('mineflayer')

// CONFIG
const HOST = process.env.HOST || 'your-server.aternos.me'
const PORT = parseInt(process.env.PORT) || 25565
const USERNAME = process.env.USERNAME || 'BotUsername'
const PASSWORD = process.env.PASSWORD || 'password'

let bot
let reconnectDelay = 10000 // 10 seconds initial reconnect delay
const maxReconnectDelay = 60000 // 1 minute max

function startBot() {
  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: '1.21.11', // lock to server version
    auth: 'offline'
  })

  let isRegistered = false

  // SPAWN
  bot.on('spawn', () => {
    console.log('[Bot] Spawned in server')
    reconnectDelay = 10000 // reset reconnect delay
    startKeepAlive()
  })

  // AUTH
  bot.on('messagestr', (msg) => {
    const message = msg.toLowerCase()
    if (!isRegistered && message.includes('/register')) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      isRegistered = true
      console.log('[Auth] Registered')
    } else if (message.includes('/login')) {
      bot.chat(`/login ${PASSWORD}`)
      console.log('[Auth] Logged in')
    }
  })

  // ERROR HANDLING
  bot.on('error', (err) => {
    console.log('[Bot Error]', err.message)
  })

  // DISCONNECT & RECONNECT
  bot.on('end', () => {
    console.log(`[Bot] Disconnected. Reconnecting in ${reconnectDelay / 1000}s...`)
    setTimeout(startBot, reconnectDelay)
    reconnectDelay = Math.min(reconnectDelay + 10000, maxReconnectDelay) // exponential backoff
  })
}

// KEEPALIVE LOOP: movement + rotation + optional chat
function startKeepAlive() {
  if (!bot || !bot.entity) return

  // Small random movements
  setInterval(() => {
    if (!bot.entity) return

    // walk forward/backward randomly
    const forward = Math.random() < 0.5
    bot.setControlState('forward', forward)
    setTimeout(() => bot.setControlState('forward', false), 500 + Math.random() * 500)

    // small random head yaw/pitch
    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * 0.5
    bot.look(yaw, pitch, true)
  }, 15000) // every 15 seconds

  // Optional AFK chat to prevent plugin kicks
  setInterval(() => {
    bot.chat('afk') 
  }, 300000) // every 5 min
}

// START
startBot()
