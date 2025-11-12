const API_ENV = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API || ''
// Default to production domain if no VITE override provided
const API_BASE = API_ENV || 'https://chargex.id.vn/api/v1'

function deriveSocketBase(apiBase: string) {
  try {
    const u = new URL(apiBase)
    return u.origin
  } catch {
    return apiBase.replace(/\/(?:api|api\/v\d+)(?:\/.*)?$/i, '').replace(/\/$/, '')
  }
}

const SOCKET_ENV = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_WS_URL || ''
// Default socket origin (same host without /api) — use secure origin
const SOCKET_BASE = SOCKET_ENV || deriveSocketBase(API_BASE) || 'https://chargex.id.vn'

const ENV = {
  BASE_URL: API_BASE,
  SOCKET_URL: SOCKET_BASE,
}

export default ENV