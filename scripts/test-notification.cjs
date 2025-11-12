const io = require('socket.io-client')
const axios = require('axios')

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const AUCTION_ID = process.env.AUCTION_ID || '56059f55-c6ad-45b5-800f-2d90443acaef'
const USER = process.env.VALID_USER || '9d25c869-f119-4809-a74a-194653d0fcce'

async function run() {
  const socket = io(`${API_BASE.replace(/^http/, 'http')}/notifications`, {
    transports: ['websocket', 'polling'],
    query: { userId: USER }
  })

  socket.on('connect', () => {
    console.log('[notif] connected', socket.id)
    socket.emit('subscribe', USER)
  })

  socket.on('notification', (n) => {
    console.log('[notif] received', JSON.stringify(n, null, 2))
  })

  socket.on('disconnect', () => console.log('[notif] disconnected'))
  socket.on('connect_error', (e) => console.error('[notif] connect_error', e))

  // Wait a moment then trigger auction end
  await new Promise((r) => setTimeout(r, 1000))
  try {
    // Use only the correct base path
    const url = `${API_BASE}/api/v1/auction/${AUCTION_ID}/end`
    console.log('[http] POST', url)
    const res = await axios.post(url)
    console.log('[http] endAuction response:', res.data)
  } catch (e) {
    console.error('[http] endAuction error:', e.response?.data || e.message)
  }

  // Wait to receive notifications
  await new Promise((r) => setTimeout(r, 3000))
  socket.disconnect()
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
