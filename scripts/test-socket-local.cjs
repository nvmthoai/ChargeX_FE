const { io } = require('socket.io-client')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const AUCTIONS_NS = `${API_BASE.replace(/^http/, 'ws')}/auctions`

async function getJoinable() {
  const candidates = [
    '/api/auction/joinable',
    '/api/v1/auction/joinable',
    '/api/auction/ids',
    '/api/v1/auction/ids'
  ]
  for (const path of candidates) {
    try {
      const res = await axios.get(`${API_BASE}${path}`)
      // handle different response shapes
      if (!res || !res.data) continue
      const data = res.data
      if (Array.isArray(data) && data.length > 0) return data[0]
      if (Array.isArray(data.items) && data.items.length > 0) return data.items[0].id
      if (Array.isArray(data.ids) && data.ids.length > 0) return data.ids[0]
      if (typeof data === 'string' && data) return data
      if (data && data.id) return data.id
    } catch (err) {
      // ignore and try next
    }
  }
  return null
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  const auctionId = process.env.AUCTION_ID || (await getJoinable()) || '00000000-0000-0000-0000-000000000000'
  console.log('Using auctionId=', auctionId)

  // 1) anonymous connect (no userId)
  const s1 = io(AUCTIONS_NS, { transports: ['websocket'] })
  s1.on('connect', () => {
    console.log('[anon] connected', s1.id)
    s1.emit('auction:join', { auctionId })
    s1.emit('auction:place_bid', { auctionId, amount: 1000 })
  })
  s1.on('auction:error', (e) => console.log('[anon] auction:error', e))
  s1.on('auction:price_update', (p) => console.log('[anon] price_update', p))

  await wait(1500)

  // 2) send userId as literal 'null'
  const s2 = io(AUCTIONS_NS, { transports: ['websocket'], auth: { userId: 'null' } })
  s2.on('connect', () => {
    console.log('[nullstr] connected', s2.id)
    s2.emit('auction:join', { auctionId })
    s2.emit('auction:place_bid', { auctionId, amount: 2000 })
  })
  s2.on('auction:error', (e) => console.log('[nullstr] auction:error', e))
  s2.on('auction:price_update', (p) => console.log('[nullstr] price_update', p))

  await wait(1500)

  // 3) valid userId (allow override from env)
  const validUser = process.env.VALID_USER || uuidv4()
  const s3 = io(AUCTIONS_NS, { transports: ['websocket'], auth: { userId: validUser } })
  s3.on('connect', () => {
    console.log('[valid] connected', s3.id, 'userId=', validUser)
    s3.emit('auction:join', { auctionId })
    s3.emit('auction:place_bid', { auctionId, amount: 3000 })
  })
  s3.on('auction:error', (e) => console.log('[valid] auction:error', e))
  s3.on('auction:price_update', (p) => console.log('[valid] price_update', p))

  // Run for a short while then disconnect
  await wait(5000)
  s1.disconnect()
  s2.disconnect()
  s3.disconnect()
  console.log('Done')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
